import {z} from 'zod';
import dbConnect  from "@/lib/dbConnect";
import UserModel from "@/model/User";
import {userValidation} from "@/schemas/signUpSchema";