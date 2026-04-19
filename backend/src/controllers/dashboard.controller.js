import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const userId = req.user?._id

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(401, "User not authenticated")
    }

    const stats = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $facet: {
                totalVideos: [
                    {
                        $count: "count"
                    }
                ],
                totalViews: [
                    {
                        $group: {
                            _id: null,
                            views: {
                                $sum: "$views"
                            }
                        }
                    }
                ],
                totalLikes: [
                    {
                        $lookup: {
                            from: "likes",
                            localField: "_id",
                            foreignField: "video",
                            as: "likes"
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            likes: {
                                $sum: {
                                    $size: "$likes"
                                }
                            }
                        }
                    }
                ]
            }
        }
    ])

    const subscribers = await Subscription.countDocuments({
        channel: new mongoose.Types.ObjectId(userId)
    })

    const channelStats = {
        totalVideos: stats[0]?.totalVideos?.[0]?.count || 0,
        totalViews: stats[0]?.totalViews?.[0]?.views || 0,
        totalLikes: stats[0]?.totalLikes?.[0]?.likes || 0,
        totalSubscribers: subscribers
    }

    return res.status(200).json(
        new ApiResponse(200, channelStats, "Channel stats fetched successfully")
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const userId = req.user?._id

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(401, "User not authenticated")
    }

    const videos = await Video.find({
        owner: new mongoose.Types.ObjectId(userId)
    }).select("_id title description thumbnail duration views isPublished createdAt")

    return res.status(200).json(
        new ApiResponse(200, videos, "Channel videos fetched successfully")
    )
})

export {
    getChannelStats, 
    getChannelVideos
    }