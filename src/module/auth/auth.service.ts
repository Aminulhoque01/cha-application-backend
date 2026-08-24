import { generateToken } from "../../utils/jwt";
import { UserModel } from "../user/user.model";
import { ILoginRequest } from "./auth.interface";

export const loginUser = async (
  data: ILoginRequest
) => {
  let user = await UserModel.findOne({
    phone: data.phone,
  });

  if (!user) {
    user = await UserModel.create({
      phone: data.phone,
      name: data.name,
      isOnline: true,
      lastSeen: new Date(),
    });
  } else {
    user.name = data.name;
    user.isOnline = true;
    user.lastSeen = new Date();

    await user.save();
  }

  const token = generateToken({
    userId: user._id.toString(),
  });

  return {
    token,
    user,
  };
};


export const getCurrentUser = async (
  userId: string
) => {
  const user = await UserModel.findById(userId).select(
    "-__v"
  );

  return user;
};