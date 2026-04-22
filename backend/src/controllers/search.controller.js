
// ─────────────────────────────────────────────────────────────────────────────
// Global Search Controller
// Searches Videos (title + description), Users (username + fullname),
// and Channels (users who have published at least one video).
//
// Endpoints wired in search.routes.js:
//   GET /api/v1/search?q=<query>&limit=<n>         → categorised results
//   GET /api/v1/search/suggest?q=<query>&limit=<n> → lightweight autocomplete
// ─────────────────────────────────────────────────────────────────────────────

import mongoose from "mongoose";
import { User }  from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { ApiError }    from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/* ─── helpers ─────────────────────────────────────────────────────────────── */

/**
 * Build a case-insensitive, partial-match regex from a raw query string.
 * Special regex characters are escaped so they don't break the query.
 */
function buildRegex(raw) {
    const escaped = raw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(escaped, "i");
}

/* ─── globalSearch ────────────────────────────────────────────────────────── */
/**
 * GET /api/v1/search?q=&limit=
 *
 * Returns:
 * {
 *   query: string,
 *   totalResults: number,
 *   results: {
 *     videos:   VideoDoc[],
 *     channels: UserDoc[],   ← users who have ≥1 published video
 *     users:    UserDoc[],
 *   }
 * }
 */
const globalSearch = asyncHandler(async (req, res) => {
    const { q, limit = "10" } = req.query;

    if (!q || !q.trim()) {
        throw new ApiError(400, "Search query `q` is required");
    }

    const query     = q.trim();
    const maxResult = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 30);
    const regex     = buildRegex(query);

    // ── Run all three searches in parallel for speed ──────────────────────
    const [videos, users, channelIds] = await Promise.all([

        // 1. Videos ─ match on title OR description, only published
        Video.aggregate([
            {
                $match: {
                    isPublished: true,
                    $or: [
                        { title:       { $regex: regex } },
                        { description: { $regex: regex } },
                    ],
                },
            },
            {
                $lookup: {
                    from:     "users",
                    localField:   "owner",
                    foreignField: "_id",
                    as:       "owner",
                    pipeline: [
                        { $project: { fullname: 1, username: 1, avatar: 1 } },
                    ],
                },
            },
            { $addFields: { owner: { $first: "$owner" } } },
            {
                $project: {
                    title: 1, thumbnail: 1, duration: 1,
                    views: 1, createdAt: 1, owner: 1,
                },
            },
            { $limit: maxResult },
        ]),

        // 2. Users ─ match on username OR fullname
        User.find(
            {
                $or: [
                    { username: { $regex: regex } },
                    { fullname: { $regex: regex } },
                ],
            },
            { username: 1, fullname: 1, avatar: 1, coverImage: 1 }
        ).limit(maxResult).lean(),

        // 3. Channel candidates ─ find userIds that own a published video
        //    (used to annotate/filter the user results as "channels")
        Video.distinct("owner", { isPublished: true }),
    ]);

    // ── Annotate users as channels if they have published videos ──────────
    const channelIdSet = new Set(channelIds.map((id) => id.toString()));

    const channels = users.filter((u) =>
        channelIdSet.has(u._id.toString())
    );

    // ── Add subscriber counts to channels (optional but useful in UI) ─────
    // We pull counts only for the channel IDs we're returning, keeping the
    // query cheap regardless of the total subscription collection size.
    let channelsWithStats = channels;
    try {
        const { subscription } = await import("../models/subscription.model.js");
        const ids = channels.map((c) => c._id);

        const subCounts = await subscription.aggregate([
            { $match: { channel: { $in: ids } } },
            { $group: { _id: "$channel", subscribers: { $sum: 1 } } },
        ]);

        const countMap = {};
        subCounts.forEach(({ _id, subscribers }) => {
            countMap[_id.toString()] = subscribers;
        });

        channelsWithStats = channels.map((c) => ({
            ...c,
            subscriberCount: countMap[c._id.toString()] || 0,
        }));
    } catch {
        // subscription model unavailable – continue without counts
    }

    const totalResults =
        videos.length + users.length + channelsWithStats.length;

    return res.status(200).json(
        new ApiResponse(200, {
            query,
            totalResults,
            results: {
                videos,
                channels: channelsWithStats,
                users,
            },
        }, "Search results fetched successfully")
    );
});

/* ─── suggest ─────────────────────────────────────────────────────────────── */
/**
 * GET /api/v1/search/suggest?q=&limit=
 *
 * Lightweight autocomplete – returns only titles and names,
 * intentionally capped at 5 results per category for fast responses.
 *
 * Returns:
 * {
 *   suggestions: {
 *     videos:   { _id, title }[],
 *     channels: { _id, username, fullname, avatar }[],
 *   }
 * }
 */
const suggest = asyncHandler(async (req, res) => {
    const { q, limit = "5" } = req.query;

    if (!q || !q.trim()) {
        return res.status(200).json(
            new ApiResponse(200, { suggestions: { videos: [], channels: [] } }, "Empty query")
        );
    }

    const query     = q.trim();
    const maxResult = Math.min(Math.max(parseInt(limit, 10) || 5, 1), 10);
    const regex     = buildRegex(query);

    const [videoSuggestions, channelSuggestions] = await Promise.all([
        Video.find(
            { isPublished: true, title: { $regex: regex } },
            { title: 1, thumbnail: 1 }
        ).limit(maxResult).lean(),

        User.find(
            {
                $or: [
                    { username: { $regex: regex } },
                    { fullname: { $regex: regex } },
                ],
            },
            { username: 1, fullname: 1, avatar: 1 }
        ).limit(maxResult).lean(),
    ]);

    return res.status(200).json(
        new ApiResponse(200, {
            suggestions: {
                videos:   videoSuggestions,
                channels: channelSuggestions,
            },
        }, "Suggestions fetched successfully")
    );
});

export { globalSearch, suggest };
