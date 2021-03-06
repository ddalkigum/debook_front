import React from 'react';
import styled from 'styled-components';
import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeReact from 'rehype-react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { useNavigate } from 'react-router';
import RoundButton from '../../component/common/RoundButton';
import RoundImage from '../../component/common/RoundImage';
import ContentTemplate from '../../component/base/ContentTemplate';
import { getKorAvailableDay } from '../../lib/date';
import {
  cancelJoinResponse,
  deletePartyResponse,
  getPartyDetail,
  registNotification,
  requestParticipateResponse,
} from '../../lib/api/party';
import { AvailableDay, Book, Party, User } from '../../types/entity';
import { mediaQuery } from '../../lib/style/media';
import { authModalHandler, userHandler, messageHandler } from '../../atom';
import { handleAPI } from '../../lib/api/common';
import CustomModal from '../../component/modal/CustomModal';

const { useState, useEffect, Fragment, createElement } = React;

const Inner = styled.div`
  display: flex;
  flex-direction: column;

  ${mediaQuery(776)} {
    margin: 0 1.5rem;
  }
`;

const Title = styled.div`
  margin-top: 3rem;
`;

const DetailConditionArea = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;

  h4 {
    margin-right: 0.625rem;
  }
`;

const OwnerArea = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 2rem;
  cursor: pointer;

  img {
    margin-right: 1rem;
  }
`;

const OwnerProfileArea = styled.div`
  display: flex;
  align-items: center;
  width: fit-content;
`;

const OwnerOptionArea = styled.div`
  display: flex;
  width: fit-content;
  h4 {
    color: ${(props) => props.theme.subText};
    margin-left: 1.5rem;

    :hover {
      color: ${(props) => props.theme.subTextHover};
    }
  }
`;

const ConditionArea = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-top: 2rem;
  padding: 2rem 1rem;
  background: ${(props) => props.theme.cardBackground};
`;

const BookInfoArea = styled.div`
  display: flex;
  flex-direction: column;
  img {
    width: 6rem;
    height: 8rem;
    margin-bottom: 0.5rem;
  }

  div {
    display: flex;
    flex-direction: column;
    line-height: 1.25rem;
  }
`;

const DescriptionArea = styled.div`
  font-family: sans-serif;
  margin: 5rem 0;
  line-height: 1.2rem;
  img {
    max-width: 100%;
  }
`;

const ApplyButtonArea = styled.div`
  margin: 2rem auto;
`;

export interface PartyParticipant {
  isOwner: boolean;
  isParticipant: boolean;
  count: number;
}

export interface PartyDetailResult {
  owner: Pick<User, 'id' | 'nickname' | 'profileImage'>;
  party: Omit<Party, 'partyID' | 'ownerID'>;
  book: Book;
  participant: PartyParticipant;
  availableDay: AvailableDay[];
}

const DetailPageLayout = ({ nickname, slug }) => {
  const navigation = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [customModalIsOpen, setCustomModal] = useState(false);
  const [relationIsLoading, setRelationIsLoading] = useState(false);
  const [isOpen, setOpen] = useRecoilState(authModalHandler);
  const [data, setData] = useState<PartyDetailResult>();
  const [content, setContent] = useState<any>(Fragment);
  const [user, setUSer] = useRecoilState(userHandler);
  const setMessage = useSetRecoilState(messageHandler);

  useEffect(() => {
    getPartyDetail(nickname, slug).then(({ result }) => {
      setData(result);
      setIsLoading(true);
      convertStringToHtml(result.party.description);
    });
  }, []);

  const convertStringToHtml = (htmlString: string) => {
    unified()
      .use(rehypeParse, { fragment: true })
      .use(rehypeReact, { createElement, Fragment })
      .process(htmlString)
      .then((file) => {
        setContent(file.result);
      });
  };

  const joinParty = async () => {
    if (!user) {
      return setOpen(true);
    }

    const response = await handleAPI(
      requestParticipateResponse(data.party.id, user.id)
    );

    if (response.result === 'EndOfRecruit') {
      setMessage({
        name: 'EndOfRecruit',
        message: '????????? ?????????????????????',
        status: 'error',
      });
      setTimeout(() => setMessage(null), 1500);
      return;
    }

    if (response.status === 'Error') {
      if (response.result.message === 'AlreadyRequestParticpate') {
        // ?????? ?????? ????????? ???????????????
        setMessage({
          message: '?????? ??????????????? ???????????????',
          name: response.result.name,
          status: 'error',
        });
        setTimeout(() => setMessage(null), 1500);
        return;
      }

      if (response.result.message === 'NotFound') {
        setMessage({
          name: 'NotFound',
          message: '???????????? ?????? ???????????????, ??????????????? ???????????????',
          status: 'error',
        });
        setTimeout(() => setMessage(null), 1500);
        return;
      }
      return;
    }

    await registNotification(data.party.id);

    setMessage({
      name: 'JoinSuccess',
      message:
        '???????????? ???????????????\r\n??????????????? ?????? ?????? ????????????????????? ?????? ???????????????',
      status: 'success',
    });

    setTimeout(() => setMessage(null), 1500);
  };

  const cancelJoin = async () => {
    await cancelJoinResponse(data.party.id);

    setMessage({
      name: 'CancelJoin',
      message: '?????? ??????????????????',
      status: 'success',
    });
    setTimeout(() => setMessage(null), 1500);
  };

  const modifyParty = async () => {
    const partyID = data.party.id;
    navigation(`/write?id=${partyID}`);
  };

  const handleCustomModal = () => {
    document.body.style.overflowY = 'hidden';
    setCustomModal(true);
  };

  const deleteParty = async () => {
    const partyID = data.party.id;
    const response = await handleAPI(deletePartyResponse(partyID));

    if (response.status === 'Error') {
      setMessage({
        name: 'Fail',
        message: '????????? ??????????????????\n\r?????? ??????????????????',
        status: 'error',
      });
    } else {
      setMessage({
        name: 'Success',
        message: '?????? ???????????????\n\r??????????????? ???????????????',
        status: 'success',
      });
    }

    setCustomModal(false);
    document.body.style.overflowY = null;

    setTimeout(() => {
      setMessage(null);
      navigation('/');
    }, 2000);
  };

  return (
    <ContentTemplate>
      <CustomModal
        acceptEvent={deleteParty}
        isOpen={customModalIsOpen}
        setOpen={setCustomModal}
        title="?????? ??????"
        message="?????????????????????????"
      />
      {isLoading ? (
        <Inner>
          <Title>
            <h1>{data.party.title}</h1>
          </Title>
          <OwnerArea>
            <OwnerProfileArea>
              <RoundImage size="SMALL" src={data.owner.profileImage} />
              <h4>{data.owner.nickname}</h4>
            </OwnerProfileArea>
            {data.participant.isOwner ? (
              <OwnerOptionArea>
                <h4 onClick={modifyParty}>??????</h4>
                <h4 onClick={handleCustomModal}>??????</h4>
              </OwnerOptionArea>
            ) : null}
          </OwnerArea>
          <ConditionArea>
            <DetailConditionArea>
              <h4>????????????:</h4>

              <h5>{data.party.isOnline ? '?????????' : '????????????'}</h5>
            </DetailConditionArea>

            {data.party.isOnline ? null : (
              <DetailConditionArea>
                <h4>????????????:</h4>
                <h5>{`${data.party.region} ${data.party.city} ${data.party.town}`}</h5>
              </DetailConditionArea>
            )}
            <DetailConditionArea>
              <h4>????????????:</h4>
              <h5>{data.party.numberOfRecruit} ???</h5>
            </DetailConditionArea>
            <DetailConditionArea>
              <h4>????????????:</h4>
              <h5>
                {getKorAvailableDay(data.availableDay.map((day) => day.dayID))}
              </h5>
            </DetailConditionArea>
            <BookInfoArea>
              <img src={data.book.thumbnail} />
              <div>
                <h5>{data.book.title}</h5>
                <h6>{data.book.authors}</h6>
              </div>
            </BookInfoArea>
          </ConditionArea>
          <DescriptionArea>{content}</DescriptionArea>
          <ApplyButtonArea>
            {data.participant.isParticipant ? (
              data.participant.isOwner ? (
                <RoundButton
                  size="LARGE"
                  color="gray"
                  text="?????? ????????? ???????????????"
                  cursor="default"
                />
              ) : (
                <RoundButton
                  size="LARGE"
                  color="pink"
                  text="?????? ??????"
                  onClick={cancelJoin}
                />
              )
            ) : (
              <RoundButton
                size="LARGE"
                color="blue"
                text="????????????"
                onClick={joinParty}
              />
            )}
          </ApplyButtonArea>
          {/* <SubTitle>
            <h3>????????? ??????</h3>
          </SubTitle> */}
          {/* {relationPartyList.map(party => {
              
            <PartyCard party={party}/>
            })} */}
        </Inner>
      ) : null}
    </ContentTemplate>
  );
};

export default DetailPageLayout;
