import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { getServerSession } from "next-auth";
import { User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

export async function POST(request: Request) {
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

  const userId = user._id;
  const { acceptingMessages } = await request.json();
  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { isAcceptingMessage: acceptingMessages },
      { new: true }
    );
    if (!updatedUser) {
      return Response.json(
        {
          success: false,
          message: "Failed to update user status to accepting messages:",
        },
        { status: 401 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Message acceptance status updated successfully.",
        updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Failed to update user status to accepting messages:");
    return Response.json(
      {
        success: false,
        message: "Error accepting messages.",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
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

  const userId = user._id;

  try {
    const foundUser = await UserModel.findById(userId);
    if (!foundUser) {
      return Response.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 }
      );
    }
  
    return Response.json(
      {
        success: true,
        isAcceptingMessage: foundUser.isAcceptingMessage,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user acceptance status:", error);
    return Response.json(
      {
        success: false,
        message: "Error fetching user acceptance status.",
      },
      { status: 500 }
    );
    
  }
}
