
import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
        videoFile: {
            type: String, // cloudinary url
            required: true,
        },
        thumbnail: {
            type: String, // cloudinary url
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        duration: {
            type: Number, // cloudinary returns duration in seconds
            required: true,
        },
        views: {
            type: Number,
            default: 0,
        },
        isPublished: {
            type: Boolean,
            default: true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

// ── Search indexes ───────────────────────────────────────────────────────────
// Compound text index – allows $text: { $search: "…" } queries.
// Weight makes title matches rank higher than description matches.
videoSchema.index(
    { title: "text", description: "text" },
    { weights: { title: 10, description: 5 }, name: "video_text_search" }
);

// Single-field indexes for common filter + sort patterns
videoSchema.index({ isPublished: 1 });          // filter: only published videos
videoSchema.index({ owner: 1, isPublished: 1 }); // filter: owner's published videos
videoSchema.index({ views: -1 });               // sort: trending (most viewed first)
videoSchema.index({ createdAt: -1 });           // sort: newest first (default)

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);
