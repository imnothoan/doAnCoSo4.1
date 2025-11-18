import ApiService from './api';
import {  Community, Post, PostMedia } from '../types';

export interface CommunityWithMembership extends Community {
  is_member?: boolean;
}

export type CommunityPost = Post & {
  community_id?: number;
  community_name?: string;
  author_avatar?: string | null;
  author_display_name?: string | null;
  post_media: PostMedia[]; // luôn là array (BE luôn trả [])
};

export interface CommunityPostsParams {
  limit?: number;
  before?: string; // ISO string cursor (created_at của bài cuối)
}

const communityService = {
  // --------- COMMUNITY LIST / DISCOVER ----------

  async getCommunities(query?: string, limit?: number): Promise<Community[]> {
    return ApiService.deduplicatedGet<Community[]>('/communities', {
      q: query,
      limit,
    });
  },

  async getSuggestedCommunities(limit?: number): Promise<Community[]> {
    return ApiService.deduplicatedGet<Community[]>('/communities/suggested', {
      limit,
    });
  },

  async searchCommunities(query: string): Promise<Community[]> {
    return ApiService.deduplicatedGet<Community[]>('/communities', {
      q: query,
    });
  },

  // --------- COMMUNITY CRUD ----------

  async getCommunity(
    communityId: number | string,
    viewerUsername?: string
  ): Promise<CommunityWithMembership> {
    const params: any = {};
    if (viewerUsername) params.viewer = viewerUsername;

    const data = await ApiService.deduplicatedGet<CommunityWithMembership>(
      `/communities/${communityId}`,
      params
    );

    return data;
  },

  async createCommunity(payload: {
    created_by: string;
    name: string;
    description?: string;
    image_url?: string;
    is_private?: boolean;
  }): Promise<Community> {
    const res = await ApiService.client.post('/communities', payload);
    return res.data;
  },

  async updateCommunity(
    communityId: number | string,
    payload: {
      actor: string;
      name?: string;
      description?: string;
      image_url?: string;
      is_private?: boolean;
    }
  ): Promise<Community> {
    const res = await ApiService.client.put(`/communities/${communityId}`, payload);
    return res.data;
  },

  async deleteCommunity(
    communityId: number | string,
    actor: string
  ): Promise<void> {
    await ApiService.client.delete(`/communities/${communityId}`, {
      data: { actor },
    });
  },

  // --------- MEMBERSHIP ----------

  async joinCommunity(
    communityId: number | string,
    username: string
  ): Promise<void> {
    await ApiService.client.post(`/communities/${communityId}/join`, { username });
  },

  async leaveCommunity(
    communityId: number | string,
    username: string
  ): Promise<void> {
    await ApiService.client.delete(`/communities/${communityId}/join`, {
      data: { username },
    });
  },

  async getCommunityMembers(
    communityId: number | string,
    limit?: number
  ): Promise<any[]> {
    const res = await ApiService.client.get(`/communities/${communityId}/members`, {
      params: { limit },
    });
    return res.data || [];
  },

  async getUserJoinedCommunities(
    username: string,
    limit?: number
  ): Promise<Community[]> {
    const res = await ApiService.client.get(
      `/communities/user/${encodeURIComponent(username)}/joined`,
      { params: { limit } }
    );
    return res.data || [];
  },

  // --------- POSTS ----------

  async getCommunityPosts(
    communityId: number | string,
    params?: CommunityPostsParams
  ): Promise<CommunityPost[]> {
    const res = await ApiService.client.get(`/communities/${communityId}/posts`, {
      params: {
        limit: params?.limit,
        before: params?.before,
      },
    });
    return res.data || [];
  },

  async createCommunityPost(
    communityId: number | string,
    data: {
      authorUsername: string;
      content?: string;
      image?: any;
      audience?: string;
      disableComments?: boolean;
      hideLikeCount?: boolean;
    }
  ): Promise<CommunityPost> {
    const formData = new FormData();
    formData.append('author_username', data.authorUsername);

    if (data.content !== undefined && data.content !== null) {
      formData.append('content', data.content);
    }
    if (data.audience) {
      formData.append('audience', data.audience);
    }
    if (typeof data.disableComments === 'boolean') {
      formData.append('disable_comments', String(data.disableComments));
    }
    if (typeof data.hideLikeCount === 'boolean') {
      formData.append('hide_like_count', String(data.hideLikeCount));
    }
    if (data.image) {
      formData.append('image', data.image);
    }

    const res = await ApiService.client.post(
      `/communities/${communityId}/posts`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return res.data;
  },

  async deleteCommunityPost(
    communityId: number | string,
    postId: number | string,
    actor: string
  ): Promise<void> {
    await ApiService.client.delete(
      `/communities/${communityId}/posts/${postId}`,
      {
        data: { actor },
      }
    );
  },

  // --------- POST LIKES ----------

  async likePost(
    communityId: number | string,
    postId: number | string,
    username: string
  ): Promise<void> {
    await ApiService.client.post(
      `/communities/${communityId}/posts/${postId}/like`,
      { username }
    );
  },

  async unlikePost(
    communityId: number | string,
    postId: number | string,
    username: string
  ): Promise<void> {
    await ApiService.client.delete(
      `/communities/${communityId}/posts/${postId}/like`,
      {
        data: { username },
      }
    );
  },

  // --------- POST COMMENTS ----------

  async addPostComment(
    communityId: number | string,
    postId: number | string,
    authorUsername: string,
    content: string,
    parentId?: number | null
  ): Promise<any> {
    const res = await ApiService.client.post(
      `/communities/${communityId}/posts/${postId}/comments`,
      {
        author_username: authorUsername,
        content,
        parent_id: parentId ?? null,
      }
    );
    return res.data;
  },

  async getPostComments(
    communityId: number | string,
    postId: number | string,
    parentId?: number | null
  ): Promise<any[]> {
    const params: any = {};
    if (parentId !== undefined) {
      // BE: parent_id=null => comment gốc; parent_id=<id> => reply
      params.parent_id = parentId === null ? 'null' : String(parentId);
    }
    const res = await ApiService.client.get(
      `/communities/${communityId}/posts/${postId}/comments`,
      { params }
    );
    return res.data || [];
  },

  async getAllPostComments(communityId: number, postId: number) {
    const res = await ApiService.client.get(
      `/communities/${communityId}/posts/${postId}/comments/all`
    );
    return res.data;
  },

  async deletePostComment(
    communityId: number | string,
    postId: number | string,
    commentId: number | string,
    actor: string
  ): Promise<void> {
    await ApiService.client.delete(
      `/communities/${communityId}/posts/${postId}/comments/${commentId}`,
      {
        data: { actor },
      }
    );
  },

  async editPostComment(
    communityId: number | string,
    postId: number | string,
    commentId: number | string,
    content: string,
    actor: string
  ): Promise<any> {
    const res = await ApiService.client.patch(
      `/communities/${communityId}/posts/${postId}/comments/${commentId}`,
      { actor, content }
    );
    return res.data;
  },

};

export default communityService;
export { communityService };
