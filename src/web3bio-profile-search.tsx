/* eslint-disable @typescript-eslint/no-explicit-any */
import { Action, ActionPanel, Icon, Image, List, useNavigation } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { useEffect, useState } from "react";
import { handleSearchPlatform } from "./utils/base";

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
    title = "Please Enter";
    if (searchTerm.length > 2 && !platform) {
      title = "invalidIdentity";
    }
    if (searchTerm.length > 2 && !profiles?.length) {
      title = "No Results";
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
        profiles?.map((item: any) => (
          <List.Item
            key={item.identity + item.platform}
            title={`${item.identity}(${item.platform})`}
            actions={
              <ActionPanel>
                <Action.Push
                  title="Profile Detail"
                  icon={Icon.AppWindowSidebarLeft}
                  target={<ProfileResults profiles={profiles} />}
                />
              </ActionPanel>
            }
          />
        ))
      )}
    </List>
  );
  function ProfileResults({ profiles }: { profiles: any }) {
    const { pop } = useNavigation();
    return (
      <List isShowingDetail searchBarPlaceholder={profiles[0].identity} onSearchTextChange={() => pop()}>
        <List.Section title="Related Profiles">
          {profiles.map((x: any) => (
            <List.Item
              key={`item_detailed_${x.identity}_${x.platform}`}
              title={`${x.identity}(${x.platform})`}
              detail={
                <List.Item.Detail
                  metadata={
                    <List.Item.Detail.Metadata>
                      <List.Item.Detail.Metadata.Label
                        title="Avatar"
                        icon={{ source: x.avatar, mask: Image.Mask.Circle,fallback:'logo-web3bio.png'  }}
                      />
                      <List.Item.Detail.Metadata.Label title="Address" text={x.address} />
                      <List.Item.Detail.Metadata.Label title="Platform" text={x.platform} />
                      <List.Item.Detail.Metadata.Label title="DisplayName" text={x.displayName} />
                      <List.Item.Detail.Metadata.Label title="Email" text={x.email || ""} />
                      <List.Item.Detail.Metadata.Label title="Description" text={x.description || ""} />
                      <List.Item.Detail.Metadata.Label title="Location" text={x.location || ""} />
                      <List.Item.Detail.Metadata.Label title="Header" text={x.header || ""} />
                    </List.Item.Detail.Metadata>
                  }
                />
              }
              actions={
                <ActionPanel>
                  <Action.OpenInBrowser title="Open in Web3bio Profile page" url={"https://web3.bio/" + x.identity} />
                </ActionPanel>
              }
            />
          ))}
        </List.Section>
      </List>
    );
  }
}
