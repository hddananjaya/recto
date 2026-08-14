"use client";

import { useEffect, useState } from "react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  getGravatarUrl,
  getInitialAvatarStage,
  getUserAvatarColorClass,
  getUserInitials,
  type AvatarImageStage,
} from "@/lib/user-avatar";
import type { User } from "@/lib/types";
import { cn } from "@/lib/utils";

type UserAvatarProps = {
  user: Pick<User, "name" | "email" | "avatarUrl">;
  size?: "sm" | "default" | "lg";
  className?: string;
};

export function UserAvatar({ user, size = "default", className }: UserAvatarProps) {
  const initials = getUserInitials(user.name, user.email);
  const colorClass = getUserAvatarColorClass(user.email);
  const [stage, setStage] = useState<AvatarImageStage>(() =>
    getInitialAvatarStage(user),
  );
  const [imageSrc, setImageSrc] = useState<string | undefined>(user.avatarUrl);

  useEffect(() => {
    let cancelled = false;

    if (stage !== "gravatar") return;

    getGravatarUrl(user.email, size === "lg" ? 80 : size === "sm" ? 48 : 64).then(
      (url) => {
        if (!cancelled) setImageSrc(url);
      },
    );

    return () => {
      cancelled = true;
    };
  }, [stage, user.email, size]);

  useEffect(() => {
    setStage(getInitialAvatarStage(user));
    setImageSrc(user.avatarUrl);
  }, [user.avatarUrl, user.email]);

  const handleImageError = () => {
    if (stage === "oauth") {
      setStage("gravatar");
      setImageSrc(undefined);
      return;
    }

    setStage("initials");
    setImageSrc(undefined);
  };

  return (
    <Avatar size={size} className={className}>
      {stage !== "initials" && imageSrc ? (
        <AvatarImage
          src={imageSrc}
          alt=""
          onError={handleImageError}
        />
      ) : null}
      <AvatarFallback
        className={cn("font-medium", colorClass)}
        delay={0}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
