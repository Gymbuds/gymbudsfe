import { fetchFunctionWithAuth } from "./auth";

export const createCommunityPost = async (
  communityId: number,
  title: string,
  content: string,
  imageUrl: string
) => {
  const post = {
    community_id: communityId,
    title,
    content,
    image_url: imageUrl,
  };

  try {
    const response = await fetchFunctionWithAuth("community_posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(post),
    });

    return response;
  } catch (err) {
    console.error("Failed to create community post:", err);
    throw err;
  }
};

export const getCommunityPosts = async (communityId: number) => {
    try {
      const response = await fetchFunctionWithAuth(
        `community_posts/community/${communityId}`,
        { method: 'GET' }
      );
      return response; // should be an array of posts
    } catch (err) {
      console.error('Failed to load community posts:', err);
      throw err;
    }
  };

  export const getUserInfoById = async (userId: number) => {
    try {
      const response = await fetchFunctionWithAuth(`match/user-info/${userId}`, {
        method: "GET",
      });
      return response;
    } catch (err) {
      console.error(`Failed to fetch user info for user ${userId}:`, err);
      throw err;
    }
  };
  