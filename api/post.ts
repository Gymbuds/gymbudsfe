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

export const updateCommunityPost = async (
  postId: number,
  title: string,
  content: string,
  imageUrl: string
) => {
  try {
    const response = await fetchFunctionWithAuth(`community_posts/${postId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        content,
        image_url: imageUrl,
      }),
    });

    return response;
  } catch (err) {
    console.error(`Failed to update community post ${postId}:`, err);
    throw err;
  }
};

export const deleteCommunityPost = async (postId: number) => {
  try {
    const response = await fetchFunctionWithAuth(`community_posts/${postId}`, {
      method: "DELETE",
    });
    return response;
  } catch (err) {
    console.error(`Failed to delete community post`, err);
  }
};

export const getCommunityPosts = async (communityId: number) => {
  try {
    const response = await fetchFunctionWithAuth(
      `community_posts/community/${communityId}`,
      { method: "GET" }
    );
    return response; // should be an array of posts
  } catch (err) {
    //   console.error('Failed to load community posts:', err);
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

export const likePost = async (postId: number) => {
  try {
    const response = await fetchFunctionWithAuth(
      `community_posts/${postId}/like`,
      { method: "POST" }
    );
    return response;
  } catch (err) {
    console.error(`Failed to like post`, err);
  }
};

export const unlikePost = async (postId: number) => {
  try {
    const response = await fetchFunctionWithAuth(
      `community_posts/${postId}/unlike`,
      { method: "DELETE" }
    );
    return response;
  } catch (err) {
    console.error(`Failed to unlike post`, err);
  }
};

export const createComment = async (postId: number, content: string) => {
  try {
    const response = await fetchFunctionWithAuth(
      `community_posts/${postId}/comment`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      }
    );
    return response;
  } catch (err) {
    console.error(`Failed to create comment`, err);
  }
};

export const editComment = async (commentId: number, content: string) => {
  try {
    const response = await fetchFunctionWithAuth(
      `community_posts/comments/${commentId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      }
    );
    return response;
  } catch (err) {
    console.error(`Failed to edit comment`, err);
  }
};

export const deleteComment = async (commentId: number) => {
  try {
    const response = await fetchFunctionWithAuth(
      `community_posts/comments/${commentId}`,
      { method: "DELETE" }
    );
    return response;
  } catch (err) {
    console.error(`Failed to delete comment`, err);
  }
};