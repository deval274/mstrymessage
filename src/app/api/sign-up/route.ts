import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { success } from "zod";

export async function POST(request: Request) {
  await dbConnect();
  try { 
    const {username, email, password}=await request.json() 
    const existingUserVerifiedByUsername = await UserModel.findOne({
        username, 
        isVerified: true
    })

    if (existingUserVerifiedByUsername) {
        return Response.json(
            {
            success: false,
            message: "Username already exists. Please choose a different username.",
            },
            { status: 400 }
        );
    }

    const existingUserByEmail = await UserModel.findOne({email})
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit verification code

    if (existingUserByEmail) {
        if(existingUserByEmail.isVerified){
            return Response.json(
                {
                    success: false,
                    message: "Email already exists. Please choose a different email.",
                },
                { status: 400 }
            );
        }
        else{
            const hasedpassword = await bcrypt.hash(password,10);
            existingUserByEmail.password = hasedpassword;
            existingUserByEmail.verifyCode = verifyCode;
            existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 60 * 60 * 1000); // Set expiry to 1 hour from now
            await existingUserByEmail.save();
        }
    }
    else{
        const hasedPassword = await bcrypt.hash(password, 10);
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 1);

        const newUser= new UserModel({
            username,
            email,
                password: hasedPassword,
                verifyCode: verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessage: true,
                messages: [],
        })

        await newUser.save();
    }

    // Send verification email
    const emailResponse = await sendVerificationEmail(
        username,
        email,
        verifyCode
    )

    if(!emailResponse.success){
        return Response.json({
            success: false,
            message: emailResponse.message,
        }, { status: 500 });
    }

    return Response.json({
            success: true,
            message: "User registered successfully. Please check your email for the verification code.",
        }, { status: 201 });

  } catch (error) {
    console.error("Error during sign-up:", error);
    return Response.json(
      {
        success: false,
        message: "Error during sign-up",
      },
      { status: 500 }
    );
  }
}
