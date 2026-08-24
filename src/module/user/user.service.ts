import { UserModel } from "./user.model";

interface UpdateProfileData {
  name?: string;
  bio?: string;
}

export const getAllUsers = async () => {
  const users = await UserModel.find()
    .select("-__v")
    .sort({
      name: 1,
    });

  return users;
};

export const searchUsers = async (
  query: string,
) => {
  const regex = new RegExp(query, "i");

  const users = await UserModel.find({
    $or: [
      {
        name: regex,
      },
      {
        phone: regex,
      },
    ],
  })
    .select("-__v")
    .sort({
      name: 1,
    })
    .limit(20);

  return users;
};

export const getUserById = async (
  userId: string,
) => {
  const user = await UserModel.findById(userId)
    .select("-__v");

  return user;
};

export const updateUserProfile = async (
  userId: string,
  data: UpdateProfileData,
) => {
  const user = await UserModel.findByIdAndUpdate(
    userId,
    {
      $set: data,
    },
    {
      new: true,
      runValidators: true,
    },
  ).select("-__v");

  return user;
};

export const updateUserAvatar = async (
  userId: string,
  avatarUrl: string,
) => {
  const user =
    await UserModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          avatar: avatarUrl,
        },
      },
      {
        new: true,
      },
    ).select("-__v");

  return user;
};