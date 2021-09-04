import { PostError } from '../common/error/index.js';
import { db } from '../repositories/index.js';
import Post from './../models/post.model.js';

export default class PostServices {
    async getDetailPost(username, slugString) {
        try {
            const result = await db.user.aggregate([
                {
                    '$match': {
                        'username': `${username}`
                    }
                }, {
                    '$unset': [
                        'password', 'salt'
                    ]
                }, {
                    '$lookup': {
                        'from': 'post',
                        'localField': '_id',
                        'foreignField': 'owner_id',
                        'as': 'owner_post'
                    }
                }, {
                    '$unwind': {
                        'path': '$owner_post'
                    }
                }, {
                    '$match': {
                        'owner_post.slugString': `${slugString}`
                    }
                }, {
                    '$lookup': {
                        'from': 'tag',
                        'localField': 'owner_post.tags',
                        'foreignField': 'name',
                        'as': 'tags'
                    }
                }
            ]).toArray();
            return result
        } catch (error) {
            return error || PostError.POST_NOT_FOUND
        }
    }
    async upPost(owner_id, title, coverImg, content, tags) {
        try {
            const newPost = new Post(owner_id, title, coverImg, content, tags);
            await db.post.insertOne(newPost);
            return newPost;
        } catch (error) {
            return error || PostError.UNKNOWN_ERROR
        }
    }

    async getPost(page, limit) {
        //trả về thông tin của chủ sở hữu bài viết
        try {
            const ss = await db.post.aggregate([
                {
                    $skip: page * limit
                },
                {
                    $limit: limit
                },
                {
                    $lookup: {
                        from: 'tag',
                        localField: 'tags',
                        foreignField: 'name',
                        as: 'tag'
                    }
                },
                {
                    $unwind: {
                        path: '$tag'
                    }
                },
                {
                    $group: {
                        _id: "$_id",
                        tags: {
                            $push: "$tag"
                        }
                    }
                },
                {
                    $lookup: {
                        from: 'post',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'postData'
                    }
                },
                {
                    $unwind: {
                        path: "$postData"
                    }
                },
                {
                    $sort: {
                        postData: -1
                    }
                },
                {
                    $lookup: {
                        from: 'user',
                        localField: 'postData.owner_id',
                        foreignField: '_id',
                        as: 'ownerData'
                    }
                },
                {
                    $unwind: {
                        path: '$ownerData'
                    }
                },
                {
                    $unset: ['ownerData.password', 'ownerData.salt', "_id"]
                },

            ]).toArray();
            const dataRes = { data: ss, status: "Success", statusCode: 200 };
            return dataRes;
        } catch (error) {
            return error || PostError.UNKNOWN_ERROR
        }
    }
}