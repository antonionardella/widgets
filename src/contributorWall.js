// @flow

import {type SvgService} from "./services/svg";
import {toEmbedableImage} from "./models/image";
import {idFromGithubAddress} from "./models/address";
import {type AvatarRepository} from "./repositories/avatars";

type ContributorWallDependencies = {|
  +avatarRepository: AvatarRepository,
  +svgService: SvgService,
|};

type ContributorWallOptions = {|
  +minCred: number,
  +maxUsers: number,
  +usersPerRow: number,
  +avatarSize: number,
  +margin: number,
|};

export const createContributorWall = async (
  users: any,
  {avatarRepository, svgService}: ContributorWallDependencies,
  {minCred, maxUsers, usersPerRow, avatarSize, margin}: ContributorWallOptions
) => {
  const selectedUsers = users
    .slice(0, maxUsers)
    .filter((user) => user.totalCred >= minCred);

  const usersWithImages = await Promise.all(
    selectedUsers.map(async (user) => {
      const id = idFromGithubAddress(user.address);
      const avatar = await avatarRepository.githubAvatar(id);
      const avatarSlug = await toEmbedableImage(avatar, avatarSize);
      return {
        id,
        totalCred: user.totalCred,
        avatarSlug,
      };
    })
  );

  return svgService.contributorWall(usersWithImages, {
    usersPerRow,
    avatarSize,
    margin,
  });
};
