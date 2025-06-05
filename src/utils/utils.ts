import { PLATFORM_DATA, DEFAULT_PLATFORM } from "web3bio-profile-kit/utils";
import { Platform, PlatformType } from "web3bio-profile-kit/types";

export const formatText = (string: string, length?: number) => {
  if (!string) return "";
  const len = length ?? 12;
  if (string.length <= len) {
    return string;
  }
  if (string.startsWith("0x") || string.length >= 42) {
    const oriAddr = string,
      chars = length || 4;
    return `${oriAddr.substring(0, chars + 2)}...${oriAddr.substring(oriAddr.length - chars)}`;
  } else {
    if (string.length > len) {
      return `${string.substr(0, len)}...`;
    }
  }
  return string;
};

export const isDomainSearch = (term: Platform) => {
  return [Platform.ens, Platform.dotbit, Platform.unstoppableDomains, Platform.space_id].includes(term);
};

export const getPlatform = (platform: Platform): Readonly<PlatformType> => {
  return PLATFORM_DATA.get(platform) || { ...DEFAULT_PLATFORM, label: platform };
};

const resolveSocialMediaLink = (name: string, type: Platform) => {
  if (!Object.keys(Platform).includes(type)) return `https://web3.bio/?s=${name}`;
  switch (type) {
    case Platform.url:
      return `${name}`;
    case Platform.dns:
    case Platform.website:
      return `https://${name}`;
    case Platform.discord:
      if (name.includes("https://")) return getPlatform(type).urlPrefix + name;
      return "";
    default:
      return getPlatform(type).urlPrefix ? getPlatform(type).urlPrefix + name : name;
  }
};

export const getSocialMediaLink = (url: string, type: Platform) => {
  let resolvedURL = "";
  if (!url) return null;
  if (url.startsWith("https")) {
    resolvedURL = url;
  } else {
    resolvedURL = resolveSocialMediaLink(url, type);
  }

  return resolvedURL;
};

export const fallbackEmoji = ["🤔", "😱", "😵‍💫", "😵", "🤦‍♀️", "💆‍♂️", "🤷‍♂️", "🙇‍♂️", "🤖"];
