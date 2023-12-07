import { Action, ActionPanel, Icon, Image, List, useNavigation } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { useEffect, useState } from "react";
import { handleSearchPlatform } from "./utils/base";
import { Profile } from "./utils/types";

export default function Command() {
  const [searchTerm, setSearchTerm] = useState("");
  const [url, setUrl] = useState("https://api.web3.bio/");
  const platform = handleSearchPlatform(searchTerm);

  useEffect(() => {
    if (searchTerm && platform) {
      setUrl("https://api.web3.bio/" + `profile/${searchTerm.toLowerCase()}`);
    }
  }, [searchTerm]);
  let title;
  const {
    isLoading,
    data: profiles,
    mutate,
  } = useFetch(url, {
    parseResponse: async (res) => {
      try {
        return await res.json();
      } catch (e) {
        return [];
      }
    },
    keepPreviousData: true,
  });
  if (searchTerm.length === 0) {
    title = "";
    if (searchTerm.length > 2 && !platform) {
      title = "Invalid Identity";
    }
    if (searchTerm.length > 2 && !profiles?.length) {
      title = "No Results, Please try different identity";
    }
  }
  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Search Ethereum (ENS), Lens, Farcaster, UD..."
      onSearchTextChange={setSearchTerm}
      throttle
      actions={
        <ActionPanel>
          <Action title="Enter to fetch" onAction={() => mutate()} />
        </ActionPanel>
      }
    >
      <List.EmptyView title={title} icon={"logo-web3bio.png"} />
      {!profiles || profiles?.error ? (
        <List.Item title={profiles?.error || "unknown error"} icon="😂" />
      ) : (
        profiles?.map((item: Profile) => (
          <List.Item
            key={item.identity + item.platform}
            title={item.identity}
            subtitle={item.platform}
            icon={{ source: item.avatar || "", mask: Image.Mask.Circle, fallback: "logo-web3bio.png" }}
            actions={
              <ActionPanel>
                <Action.Push
                  title="Profile Detail"
                  icon={Icon.AppWindowSidebarLeft}
                  target={<ProfileResults profiles={profiles} searchTerm={item.identity} />}
                />
              </ActionPanel>
            }
          />
        ))
      )}
    </List>
  );
  function ProfileResults({ profiles, searchTerm }: { profiles: Profile[]; searchTerm: string }) {
    const { pop } = useNavigation();
    return (
      <List isShowingDetail searchBarPlaceholder={searchTerm} onSearchTextChange={() => pop()}>
        <List.Section title="Related Profiles">
          {profiles.map((x: Profile) => {
            return (
              <List.Item
                key={`item_detailed_${x.identity}_${x.platform}`}
                title={x.identity}
                subtitle={x.platform}
                icon={{ source: x.avatar || "", mask: Image.Mask.Circle, fallback: "logo-web3bio.png" }}
                detail={
                  <List.Item.Detail
                    metadata={
                      <List.Item.Detail.Metadata>
                        <List.Item.Detail.Metadata.Label title="#️⃣ Basic" />
                        <List.Item.Detail.Metadata.Separator />
                        <List.Item.Detail.Metadata.Label title="Address" text={x.address} />
                        <List.Item.Detail.Metadata.Label title="Platform" text={x.platform} />
                        <List.Item.Detail.Metadata.Label title="DisplayName" text={x.displayName || ""} />
                        {x.email && <List.Item.Detail.Metadata.Label title="Email" text={x.email || ""} />}
                        {x.description && (
                          <List.Item.Detail.Metadata.Label title="Description" text={x.description || ""} />
                        )}
                        {x.location && <List.Item.Detail.Metadata.Label title="Location" text={x.location || ""} />}
                        {x.header && (
                          <List.Item.Detail.Metadata.Label
                            title="Header"
                            icon={{ source: x.header, mask: Image.Mask.RoundedRectangle, fallback: "logo-web3bio.png" }}
                          />
                        )}
                        <List.Item.Detail.Metadata.Label title="🌐 Social Medias" />
                        <List.Item.Detail.Metadata.Separator />
                        {Object.keys(x.links || {}).map((i) => {
                          const item = x.links[i];
                          return (
                            item.handle && (
                              <List.Item.Detail.Metadata.Link
                                key={`${item.handle}_${item.link}`}
                                title={i}
                                text={item.handle}
                                target={item.link}
                              />
                            )
                          );
                        })}
                      </List.Item.Detail.Metadata>
                    }
                  />
                }
                actions={
                  <ActionPanel>
                    <Action.OpenInBrowser
                      title="Open in Web3.bio Profile page"
                      url={"https://web3.bio/" + x.identity}
                    />
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
