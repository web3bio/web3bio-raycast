export const regexEns = /.*\.(eth|xyz|app|luxe|kred|art|ceo|club)$/i,
  regexLens = /.*\.lens$/i,
  regexDotbit = /.*\.bit$/i,
  regexEth = /^0x[a-fA-F0-9]{40}$/i,
  regexTwitter = /^[A-Za-z0-9_]{1,15}$/i,
  regexFarcaster = /^[A-Za-z0-9_-]{1,61}(?:|\.eth)(?:|\.farcaster)$/i,
  regexUnstoppableDomains =
    /.*\.(crypto|888|nft|blockchain|bitcoin|dao|x|klever|hi|zil|kresus|polygon|wallet|binanceus|anime|go|manga|eth)$/i,
  regexSpaceid = /.*\.(bnb|arb)$/i,
  regexAvatar = /^0x[a-f0-9]{66}$/i;
export const handleSearchPlatform = (term: string) => {
  switch (!!term) {
    case regexEns.test(term):
      return "ens";
    case regexEth.test(term):
      return "ethereum";
    case regexLens.test(term):
      return "lens";
    case regexUnstoppableDomains.test(term):
      return "unstoppabledomains";
    case regexDotbit.test(term):
      return "dotbit";
    case regexFarcaster.test(term):
      return "farcaster";
    default:
      return false;
  }
};
