import { Action, ActionPanel, Icon, Image, List, useNavigation } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { useEffect, useState } from "react";
import { Profile } from "./utils/types";
import { handleSearchPlatform, SocialPlatformMapping } from "./utils/utils";
import { PlatformType } from "./utils/platform";

const API_END_POINT = "https://api.web3.bio";

export default function Command() {
  const [searchTerm, setSearchTerm] = useState("");
  const [url, setUrl] = useState(API_END_POINT);
  const platform = handleSearchPlatform(searchTerm);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    if (searchTerm && platform) {
      setUrl(API_END_POINT + `/profile/${searchTerm.toLowerCase()}`);
    }
  }, [searchTerm]);
  const {
    isLoading,
    data: profiles,
    mutate,
  } = useFetch(url, {
    parseResponse: async (res) => {
      try {
        const rr = await res.json();
        if (rr.error) return [];
        return rr;
      } catch (e) {
        return [];
      }
    },
    keepPreviousData: true,
  });
  const emptyText = (() => {
    if (!searchTerm) return "🔍 Search Ethereum (ENS), Lens, Farcaster, UD...";
    if (searchTerm.length > 0 && !platform) return "❌ Invalid Identity. Please try different identity.";
    if (searchTerm.length > 0 && platform && !profiles?.length) return "👽 No Results. Please try different identity.";
    return "";
  })();
  function PlatformFilter({ platforms, onSelectChange }: { platforms: string[]; onSelectChange: (v: string) => void }) {
    const _set = new Set(platforms);
    return (
      platforms?.length > 0 && (
        <List.Dropdown
          tooltip="Select Platform Filter"
          storeValue={false}
          onChange={(newVal) => onSelectChange(newVal)}
        >
          <List.Dropdown.Section title="Platform filter">
            <List.Dropdown.Item key={"ALL"} title={"ALL"} value={"ALL"} />
            {[..._set].map((x: string) => {
              return <List.Dropdown.Item key={x} title={x.toUpperCase()} value={x} />;
            })}
          </List.Dropdown.Section>
        </List.Dropdown>
      )
    );
  }
  return (
    <List
      isLoading={isLoading}
      navigationTitle="Web3.bio"
      searchBarPlaceholder="Search Ethereum (ENS), Lens, Farcaster, UD..."
      onSearchTextChange={setSearchTerm}
      throttle={false}
      searchBarAccessory={
        <PlatformFilter
          platforms={(!profiles?.length || profiles.error ? [] : profiles)?.map((x: Profile) => x.platform)}
          onSelectChange={setFilter}
        />
      }
      actions={
        <ActionPanel>
          <Action title="Enter to fetch" onAction={() => mutate()} />
        </ActionPanel>
      }
    >
      <List.EmptyView title={emptyText} icon={"logo-web3bio.png"} />
      <List.Section title="Profiles">
        {profiles
          ?.filter((x: Profile) => {
            if (filter === "ALL") return x;
            return x.platform === filter;
          })
          ?.map((item: Profile) => (
            <List.Item
              key={item.identity + item.platform}
              title={item.displayName || item.identity}
              subtitle={item.displayName && item.displayName === item.identity ? "" : item.identity}
              icon={{ source: item.avatar || "", mask: Image.Mask.Circle }}
              accessories={[
                { text: SocialPlatformMapping(item.platform as PlatformType).label, icon: SocialPlatformMapping(item.platform as PlatformType).icon },
              ]}
              actions={
                <ActionPanel>
                  <Action.Push
                    title="Profile Detail"
                    icon={Icon.AppWindowSidebarLeft}
                    target={
                      <ProfileResults
                        profiles={[item, ...profiles.filter((x: Profile) => item !== x)]}
                        searchTerm={item.identity}
                      />
                    }
                  />
                </ActionPanel>
              }
              
            />
          ))}
      </List.Section>
    </List>
  );
  function ProfileResults({ profiles, searchTerm }: { profiles: Profile[]; searchTerm: string }) {
    const { pop } = useNavigation();
    return (
      <List isShowingDetail searchBarPlaceholder={searchTerm} onSearchTextChange={() => pop()}>
        <List.Section title="Profiles">
          {profiles.map((x: Profile) => {
            const relatedPath = `${x.identity}${
              x.platform === PlatformType.farcaster ? ".farcaster" : ""
            }`;
            return (
              <List.Item
                key={`item_detailed_${x.identity}_${x.platform}`}
                title={x.displayName || x.identity}
                subtitle={x.displayName && x.displayName === x.identity ? "" : x.identity}
                icon={{ source: x.avatar || "", mask: Image.Mask.Circle }}
                accessories={[
                  { text: SocialPlatformMapping(x.platform as PlatformType).label, icon: SocialPlatformMapping(x.platform as PlatformType).icon },
                ]}
                detail={
                  <List.Item.Detail
                    metadata={
                      <List.Item.Detail.Metadata>
                        {x.displayName === x.identity ? (
                          <List.Item.Detail.Metadata.Label title="" text={x.displayName} icon={{ source: x.avatar || "", mask: Image.Mask.Circle }} />
                        ) : (
                          <>
                            <List.Item.Detail.Metadata.Label title="" text={x.displayName || ""} icon={{ source: x.avatar || "", mask: Image.Mask.Circle }} />
                            <List.Item.Detail.Metadata.Label title="" text={x.identity} />
                          </>
                        )} 
                        <List.Item.Detail.Metadata.Separator />
                        <List.Item.Detail.Metadata.Label title="Address" text={x.address} />
                        <List.Item.Detail.Metadata.Label title="Platform" text={SocialPlatformMapping(x.platform as PlatformType).label} icon={SocialPlatformMapping(x.platform as PlatformType).icon} />
                        {x.description && (
                          <List.Item.Detail.Metadata.Label title="Bio" text={x.description} />
                        )}
                        {x.email && <List.Item.Detail.Metadata.Label title="Email" text={x.email} />}
                        {x.location && <List.Item.Detail.Metadata.Label title="Location" text={x.location} />}

                        {Object.keys(x.links)?.length > 0 && (
                          <>
                            <List.Item.Detail.Metadata.Separator />
                            <List.Item.Detail.Metadata.Label title="🌐 Social links" />
                            {Object.keys(x.links).map((key) => {
                              const item = x.links[key as PlatformType];
                              return (
                                item.handle && (
                                  <List.Item.Detail.Metadata.Link
                                    key={`${key}_${item.handle}`}
                                    text={item.handle}
                                    title={SocialPlatformMapping(key as PlatformType).label}
                                    target={item.link}
                                  />
                                )
                              );
                            })}
                          </>
                        )}
                        <List.Item.Detail.Metadata.Separator />
                        <List.Item.Detail.Metadata.Label title="More on Web3.bio" text="🖼 NFTs 🌈 Activity Feeds 🔮 POAPs" />
                      </List.Item.Detail.Metadata>
                    }
                  />
                }
                actions={
                  <ActionPanel>
                    <Action.OpenInBrowser
                      title="Open in Web3.bio Profile"
                      url={"https://web3.bio/" + relatedPath}
                    />
                    <Action.CopyToClipboard title="Copy Address" content={String(x.address)} />
                  </ActionPanel>
                }
              />
            );
          })}
        </List.Section>
      </List>
    );
  }
}
