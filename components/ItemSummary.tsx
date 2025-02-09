// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import VoteButton from "@/islands/VoteButton.tsx";
import type { Item, User } from "@/utils/db.ts";
import UserPostedAt from "./UserPostedAt.tsx";

export interface ItemSummaryProps {
  item: Item;
  user: User;
  isVoted: boolean;
}

export default function ItemSummary(props: ItemSummaryProps) {
  return (
    <div class="py-2 flex gap-4">
      <VoteButton
        item={props.item}
        isVoted={props.isVoted}
      />
      <div class="space-y-1">
        <p>
          <a
            class="hover:underline mr-4"
            href={`/item/${props.item.id}`}
          >
            {props.item.title}
          </a>
          <a
            class="hover:underline text-gray-500"
            href={props.item.url}
            target="_blank"
          >
            {new URL(props.item.url).host} ↗
          </a>
        </p>
        <UserPostedAt
          userLogin={props.user.login}
          createdAt={props.item.createdAt}
        />
      </div>
    </div>
  );
}
