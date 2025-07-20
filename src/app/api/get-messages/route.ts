import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { getServerSession } from "next-auth";
import { User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import mongoose from "mongoose";

export async function GET(request: Request){
    await dbConnect();
    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;
    if (!session || !session.user) {
        return Response.json(
            {
                success: false,
                message: "Unauthorized access.",
            },
            { status: 401 }
        );
    }

    // get the monggose object id from ther user, here user._id is into string format it will giveproblem in further in aggregation pipeline
    const userId = new mongoose.Types.ObjectId(user._id);

    try {
        const user = await UserModel.aggregate([
            { $match: {id:userId}},
            { $unwind: '$messages'},
            { $sort: {'message.createdAt': -1} },
            { $group: {_id: '$_id', messages: {$push: '$messages'}} },
        ])
        if (!user || user.length === 0) {
            return Response.json(
                {
                    success: false,
                    message: "No messages found for the user.",
                },
                { status: 404 }
            );
        }

        return Response.json(
            {
                success: true,
                messages: user[0].messages,
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error fetching messages:", error);
        return Response.json(
            {
                success: false,
                message: "Error fetching messages.",
            },
            { status: 500 }
        );
        
    }

}