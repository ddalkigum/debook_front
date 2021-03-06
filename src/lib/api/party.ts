import { MainCard } from '../../container/home/HomeLayout';
import { PartyDetailResult } from '../../container/party/DetailLayout';
import { DateTime, Party } from '../../types/entity';
import apiClient from './client';
import { BaseResponse } from './interface';

export interface BookMeta {
  page: number;
  nextPage?: number;
  isEnd: boolean;
  lastPage: number;
}

export interface BookInfo {
  id: string;
  authors: string[];
  thumbnail: string;
  title: string;
}

export interface SearchBookResult {
  bookList: BookInfo[];
  meta: BookMeta;
}

export type BookList = BookInfo[];

export type InsertParty = Omit<
  Party,
  'id' | 'slug' | 'bookID' | 'ownerID' | keyof DateTime
>;

export interface PartyContext {
  party: Partial<Party>;
  availableDay: string[];
  availableDayList?: string[];
  book: BookInfo;
}

export const getBookList = async (title: string, page: number) => {
  const encodedTitle = encodeURIComponent(title);
  const response = await apiClient.get<BaseResponse<SearchBookResult>>(
    `/v1/party/search/book?title=${encodedTitle}&page=${page}`
  );
  return response.data;
};

export const registPartyResponse = async (context: PartyContext) => {
  const response = await apiClient.post('/v1/party/regist', context);
  return response.data;
};

export const getPartyList = async (page: number) => {
  const response = await apiClient.get<BaseResponse<MainCard[]>>(
    `/v1/party/recent?page=${page}`
  );
  return response.data;
};

export const getPartyDetail = async (nickname: string, title: string) => {
  const response = await apiClient.get<BaseResponse<PartyDetailResult>>(
    `/v1/party/${nickname}/${title}`
  );
  return response.data;
};

export const getParticipatePartyList = async (userID: number) => {
  const response = await apiClient.get<BaseResponse<MainCard[]>>(
    `/v1/party/participate/${userID}`
  );
  return response.data;
};

export const requestParticipateResponse = async (
  partyID: string,
  userID?: number
) => {
  const response = await apiClient.post<BaseResponse<string>>(
    '/v1/party/join',
    { partyID, userID }
  );

  return response.data;
};

export const registNotification = async (partyID: string) => {
  const response = await apiClient.post('/v1/party/notification', { partyID });
  return response.data;
};

export const getUserNotification = async () => {
  const response = await apiClient.get<BaseResponse<any[]>>(
    '/v1/party/notification'
  );
  return response.data;
};

export const cancelJoinResponse = async (partyID: string) => {
  const response = await apiClient.delete<BaseResponse<string>>(
    `/v1/party/participate/${partyID}`
  );
  return response.data;
};

export const getModifyPartyResponse = async (partyID: string) => {
  const response = await apiClient.get<BaseResponse<any>>(
    `/v1/party/modify?id=${partyID}`
  );
  return response.data;
};

export const updatePartyResponse = async (
  partyID: string,
  context: PartyContext
) => {
  const response = await apiClient.patch('/v1/party/update', {
    partyID,
    ...context,
  });
  return response.data;
};

export const deletePartyResponse = async (partyID: string) => {
  const response = await apiClient.delete<BaseResponse<string>>(
    `/v1/party?id=${partyID}`
  );
  return response.data;
};
