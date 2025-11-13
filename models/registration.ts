import mongoose , {Schema , models , Document} from "mongoose";


export interface UserDocument extends Document
{
    firstName:string,
    lastName:string,
    email:string,
    idCardUrl:string,
    idCardPublicId:string,  
    contact?:string,
    age?: number,
    organization?: string,
    industry?: string,
    linkedin?: string,
    isAdmin:boolean,
    isSuperAdmin?:boolean, // Super admin can manage other admins
    password?:string, // Optional: Only for admin users
   
}

const users_reg= new Schema(
{
email:
{
 type:String,
 require:[true,"Email cannot be empty"],
 minlength:[5,"Email length must at-least 5 character long"],
 unique:true, // Only email should be unique
 lowercase: true,
 trim: true,
},

firstName:
{
 type:String,
 require:[true,"First name cannot be empty"],
 minlength:[2,"First name must be at least 2 characters"],
 trim: true,
},

lastName:
{
 type:String,
 require:[true,"Last name cannot be empty"],
 minlength:[2,"Last name must be at least 2 characters"],
 trim: true,
},

contact:
{
 type:String,
 require:[true,"Contact cannot be empty"],
 minlength:[10,"Contact length must be at least 10 characters"],
 maxlength:[10,"Contact length must be at most 10 characters"],
 unique:true, // Phone number should also be unique
 trim: true,
},

idCardUrl:
{
 type:String,
 require:false,
},

idCardPublicId:
{
 type:String,
 require:false,
},

age:
{
    type:Number,
    required:false,
},

organization:
{
    type:String,
    required:false,
    trim:true,
},

industry:
{
    type:String,
    required:false,
    trim:true,
},

linkedin:
{
    type:String,
    required:false,
    trim:true,
},

password:
{
    type:String,
    required:false, // Not required for regular users, only for admins
    select:false, // Don't return password in queries by default
},

isAdmin:
{
    type:Boolean,
    default:false
},

isSuperAdmin:
{
    type:Boolean,
    default:false
}
},

{
timestamps:true
})

const users = mongoose.models.User || mongoose.model<UserDocument>("User",users_reg)

export default users;