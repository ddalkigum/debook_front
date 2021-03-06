import React, { useEffect } from 'react';
import ReactQuill from 'react-quill';
import styled from 'styled-components';
import { useLocation, useNavigate } from 'react-router';
import { useRecoilState } from 'recoil';
import ContentTemplate from '../../component/base/ContentTemplate';
import RoundButton from '../../component/common/RoundButton';
import AddressModal from '../../component/modal/AddressModal';
import BookSearchModal from '../../component/modal/BookSearchModal';
import Editor from '../../component/write/Editor';
import { theme } from '../../style/theme';
import { Book, Party, User } from '../../types/entity';
import {
  getModifyPartyResponse,
  registPartyResponse,
  updatePartyResponse,
} from '../../lib/api/party';
import { messageHandler } from '../../atom';
import { handleAPI } from '../../lib/api/common';
import ApplyThemeSearch from '../../component/icon/Search';

const { useRef, useState, useReducer } = React;

const TitleArea = styled.div`
  width: 100%;
  padding: 2rem 0;
  input {
    width: 100%;
    padding: 0.5rem 0;
    background: inherit;
    font-size: 1.875rem;
    border-bottom: 2px solid ${theme.boldLine};

    :hover {
      outline: none;
    }

    :focus {
      outline: none;
    }
  }
`;

const RecruitPlanArea = styled.div`
  padding: 0 0 1rem 0;

  div {
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
  }

  input {
    margin-bottom: 0.375rem;
  }

  h4 {
    margin-right: 1.5rem;
  }

  h5 {
    color: ${(props) => props.theme.subText};
  }

  button {
    margin-right: 0.5rem;
  }
`;

const BaseInput = styled.input`
  background: inherit;
  font-size: 1rem;
  padding-top: 0.2rem;
  border-bottom: 1px solid ${theme.boldLine};
  :hover {
    outline: none;
  }

  :focus {
    outline: none;
  }
`;

const RecruitPlanInput = styled(BaseInput)`
  width: 2rem;
  background: inherit;
  font-size: 1rem;
  padding-top: 0.2rem;

  border-bottom: 1px solid ${theme.boldLine};
  :hover {
    outline: none;
  }

  :focus {
    outline: none;
  }
`;

const SideWarningMessage = styled.h5`
  color: ${(props) => props.theme.primaryRelative50};
  margin-left: 1rem;
`;

const BookInfoArea = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 1.5rem;
  padding: 1rem;
`;

const WarningMessageArea = styled.div`
  text-align: center;
  padding-top: 2rem;
  color: ${(props) => props.theme.primaryRelative50};
`;

const SubmitButtonArea = styled.div`
  margin: 2rem 0;
  display: flex;
  justify-content: center;
`;

const dayList = [
  { available: false, kor: '???', eng: 'mon' },
  { available: false, kor: '???', eng: 'tue' },
  { available: false, kor: '???', eng: 'wed' },
  { available: false, kor: '???', eng: 'thu' },
  { available: false, kor: '???', eng: 'fri' },
  { available: false, kor: '???', eng: 'sat' },
  { available: false, kor: '???', eng: 'sun' },
];

const WriteLayout = ({ user }: { user: User }) => {
  // state
  const [isOnline, setIsOnline] = useState(true);
  const [address, setAddress] = useState('');
  const [book, setBook] = useState<Book>();
  const [bookSearchModalOpen, setBookSearchModalOpen] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [warningeMessage, setWarningMessage] = useState('');
  const [currentDeacription, setCurrentDescription] = useState('');
  const [recruitMemberWarningMessage, setRecruitMemberWarningMessage] =
    useState('');
  const [message, setMessage] = useRecoilState(messageHandler);

  // ref
  const titleRef = useRef<HTMLInputElement>();
  const numberOfRecruitRef = useRef<HTMLInputElement>();
  const openChatURLRef = useRef<HTMLInputElement>();
  const openChatPasswordRef = useRef<HTMLInputElement>();
  const quillRef = useRef<ReactQuill>(null);

  const navigation = useNavigate();
  const location = useLocation();
  const [_, partyID] = location.search.split('=');

  const [dayState, setDayState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    dayList
  );

  useEffect(() => {
    if (partyID) {
      handleAPI(getModifyPartyResponse(partyID)).then(({ result }) => {
        const { party, book, availableDayList } = result;
        titleRef.current.value = party.title;
        numberOfRecruitRef.current.value = party.numberOfRecruit.toString();
        openChatURLRef.current.value = party.openChatURL;
        openChatPasswordRef.current.value = party.openChatPassword;

        for (let availableDay of availableDayList) {
          for (let day of dayList) {
            if (availableDay === day.eng) {
              day.available = true;
            }
          }
        }

        setDayState(dayList);
        setIsOnline(party.isOnline);
        book.authors = book.authors.split(', ');
        setBook(book);

        if (!party.isOnline) {
          setAddress(`${party.region} ${party.city} ${party.town}`);
        }
        setCurrentDescription(party.description);
      });
    }
  }, []);

  const modifyAvailableDay = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    const korDay = event.currentTarget.innerText;
    for (let dayObject of dayList) {
      if (dayObject.kor === korDay) {
        dayObject.available = !dayObject.available;
      }
    }

    setDayState(dayList);
  };

  const checkLimitNumber = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRecruitMemberWarningMessage('');
    const number = event.currentTarget.value;
    const stringToNumber = Number(number);
    const validateNumber = RegExp('(^[0-9]*$)').test(number);

    if (!validateNumber) {
      event.currentTarget.value = '';
      return setRecruitMemberWarningMessage('????????? ??????????????????');
    }

    if (number.startsWith('0')) {
      event.currentTarget.value = '';
      return setRecruitMemberWarningMessage('0??? ?????? ????????? ??????????????????');
    }

    if (stringToNumber > 12) {
      event.currentTarget.value = null;
      return setRecruitMemberWarningMessage('?????? 12????????? ????????????');
    }
  };

  const setOnline = () => {
    setIsOnline(true);
  };

  const setOffline = () => {
    setIsOnline(false);
  };

  const openAddressModal = () => {
    document.body.style.overflowY = 'hidden';
    setAddressModalOpen(!addressModalOpen);
  };

  const openBookModal = () => {
    document.body.style.overflowY = 'hidden';
    setBookSearchModalOpen(!bookSearchModalOpen);
  };

  const regist = async (event) => {
    const availableDayList = []; // ['mon', 'tue']

    for (let i = 0; i < dayList.length; i++) {
      const dayObject = dayList[i];
      if (dayObject.available) availableDayList.push(dayObject.eng);
    }

    const title = titleRef.current.value;
    const numberOfRecruit = Number(numberOfRecruitRef.current.value);
    const description = quillRef.current.value;
    const openChatURL = openChatURLRef.current.value;
    const openChatPassword = openChatPasswordRef.current.value;

    // validation
    if (!title) {
      return setWarningMessage('????????? ??????????????????');
    }

    const trimTitle = title.trim();

    if (trimTitle.length > 20) {
      return setWarningMessage('????????? 20????????? ??????????????????');
    }

    if (!numberOfRecruit) {
      return setWarningMessage('???????????? ??????????????????');
    }

    if (!numberOfRecruit) {
      return setWarningMessage('??????????????? ????????? ??????????????????');
    }

    if (numberOfRecruit < 2) {
      return setWarningMessage('2????????? ????????????');
    }

    if (!openChatURL) {
      return setWarningMessage('??????????????? ????????? ??????????????????');
    }

    if (!book) {
      return setWarningMessage('?????? ??????????????????');
    }

    const descriptionRegex = /<[^>]*>?/g;
    if (!description || description === '') {
      return setWarningMessage('????????? ??????????????????');
    }

    if (description.toString().replace(descriptionRegex, '').trim() === '') {
      return setWarningMessage('????????? ??????????????????');
    }

    const splitAddress = address.split(' ');
    const [region, city, town] = splitAddress.map((address) => address.trim());

    const party: Partial<Party> = {
      title: trimTitle,
      numberOfRecruit,
      openChatURL,
      openChatPassword,
      isOnline,
      description: description.toString(),
      region: isOnline ? undefined : region,
      city: isOnline ? undefined : city,
      town: isOnline ? undefined : town,
    };

    if (partyID) {
      await updatePartyResponse(partyID, {
        party,
        availableDay: availableDayList,
        book,
      });
      navigation('/');
      return;
    }

    try {
      await registPartyResponse({
        party,
        availableDay: availableDayList,
        book,
      });
      navigation('/');
    } catch (error) {
      setMessage({
        name: error.name,
        message: '????????? ??????????????????',
        status: 'error',
      });
      setTimeout(() => setMessage(null), 1500);
    }
  };

  return (
    <ContentTemplate>
      <TitleArea>
        <input placeholder={'????????? ??????????????????!'} ref={titleRef} />
      </TitleArea>
      <RecruitPlanArea>
        <div>
          <h4>?????? ??????</h4>
          <RecruitPlanInput
            ref={numberOfRecruitRef}
            onChange={checkLimitNumber}
          />
          {recruitMemberWarningMessage ? (
            <SideWarningMessage>
              {recruitMemberWarningMessage}
            </SideWarningMessage>
          ) : null}
        </div>
        <div>
          <h4>?????? ????????? ??????</h4>
          <BaseInput
            style={{ width: '20rem', maxWidth: '60%' }}
            ref={openChatURLRef}
          />
        </div>

        <div>
          <h4>?????? ????????? ????????????</h4>
          <BaseInput style={{ width: '10rem' }} ref={openChatPasswordRef} />
        </div>
        <div>
          <h4>?????? ??????</h4>
          {dayList.map((day, index) => {
            return (
              <RoundButton
                key={index}
                size="SMALL"
                color={day.available ? 'blue' : 'gray'}
                text={day.kor}
                onClick={modifyAvailableDay}
              />
            );
          })}
        </div>
        <div>
          <h4>?????? ??????</h4>
          <RoundButton
            size="SMALL"
            color={isOnline ? 'blue' : 'gray'}
            text="?????????"
            onClick={setOnline}
          />
          <RoundButton
            size="SMALL"
            color={isOnline ? 'gray' : 'blue'}
            text="????????????"
            onClick={setOffline}
          />
        </div>
        {isOnline ? null : (
          <div>
            <h4>?????? ??????</h4>
            {address ? (
              <>
                <h4>{address}</h4>
                <ApplyThemeSearch size="1.5rem" onClick={openAddressModal} />
              </>
            ) : (
              <BaseInput
                style={{ width: '10rem', fontSize: '0.875rem' }}
                placeholder="????????? ??????????????????"
                onClick={openAddressModal}
              />
            )}
          </div>
        )}
        <div>
          <h4>?????? ??????</h4>
          <ApplyThemeSearch size="1.5rem" onClick={openBookModal} />
        </div>
        <div style={{ alignItems: 'flex-start' }}>
          {book ? (
            <>
              <img
                src={book.thumbnail}
                style={{ width: '4rem', height: '6rem' }}
              />
              <BookInfoArea>
                <h4>{book.title}</h4>
                <h5>
                  {book.authors.map((author, index) => {
                    const seperator =
                      index === book.authors.length - 1 ? ' ' : ', ';
                    return author + seperator;
                  })}
                </h5>
              </BookInfoArea>
            </>
          ) : null}
        </div>
      </RecruitPlanArea>
      <Editor
        user={user}
        currentDescription={currentDeacription}
        quillRef={quillRef}
      />
      <WarningMessageArea>
        <h5>{warningeMessage}</h5>
      </WarningMessageArea>
      <SubmitButtonArea>
        <RoundButton
          size="LARGE"
          color="blue"
          text="????????????"
          onClick={regist}
        />
      </SubmitButtonArea>
      {addressModalOpen ? (
        <AddressModal
          isOpen={addressModalOpen}
          setOpen={setAddressModalOpen}
          currentAddress={address}
          setCurrentAddress={setAddress}
        />
      ) : null}
      {bookSearchModalOpen ? (
        <BookSearchModal
          isOpen={bookSearchModalOpen}
          setOpen={openBookModal}
          setBook={setBook}
        ></BookSearchModal>
      ) : null}
    </ContentTemplate>
  );
};

export default WriteLayout;
