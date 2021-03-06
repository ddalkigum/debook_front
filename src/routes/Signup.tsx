import React from 'react';
import { useLocation, useNavigate } from 'react-router';
import styled from 'styled-components';
import RoundButton from '../component/common/RoundButton';
import NotFound from '../component/error/NotFound';
import MainTemplate from '../component/base/MainTemplate';
import {
  checkCertificationCodeResponse,
  signupResponse,
} from '../lib/api/auth';
import { handleAPI } from '../lib/api/common';
import useSetMessage from '../lib/hooks/useSetMessage';

const { useState, useEffect } = React;

const Block = styled.div`
  width: 500px;
  max-width: 90%;
  height: 100%;
  margin: auto;
  margin-top: 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const SubTitle = styled.div`
  padding: 2rem 0 1rem 0;
`;

const EmailArea = styled.div`
  span {
    font-size: 1rem;
  }
`;

const NicknameInputArea = styled.div`
  display: flex;
  justify-content: space-between;

  input {
    width: 60%;
    outline: none;
    padding: 0.5rem 0;
    background-color: ${(props) => props.theme.mainBackground};
    border-bottom: 2px solid ${(props) => props.theme.subText};
    font-size: 1rem;

    :focus {
      border-bottom: 2px solid ${(props) => props.theme.primary50};
    }
  }
`;

const CheckSignupArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 0;

  button {
    margin: 1rem 0;
  }

  span {
    color: ${(props) => props.theme.primaryRelative50};
  }
`;

const validateNickname = (nickname: string) => {
  if (nickname === '') {
    return '닉네임을 입력해주세요';
  }

  if (nickname.length > 10) {
    return '닉네임은 10자까지 가능합니다';
  }

  const trimed = nickname.trim();
  if (nickname !== trimed) {
    return '공백은 포함할 수 없습니다';
  }

  const checkBlank = /[\s]/g;
  if (checkBlank.test(nickname)) {
    return '공백은 포함할 수 없습니다';
  }

  const regex = /^[a-zA-Z가-힣0-9-_]{3,20}$/;
  if (!regex.test(nickname)) {
    return '닉네임은 3~10자 알파벳, 한글, 숫자, -, _ 로 만들어주세요';
  }
};

const Signup = () => {
  const navigation = useNavigate();
  const location = useLocation();
  const queryString = location.search;
  const [_, code] = queryString.split('=');

  const nicknameInput = React.createRef<HTMLInputElement>();
  const [isDuplicate, setDuplicate] = useState(false);
  const [safeEmail, setSafeEmail] = useState('');
  const [isLoading, setPage] = useState(false);

  if (!code) {
    return <NotFound />;
  }

  useEffect(() => {
    const getEmailRequest = async (code: string) => {
      const response = await handleAPI(checkCertificationCodeResponse(code));
      const { email } = response.result;

      if (response.result.message === 'DoesNotExistCertification') {
        navigation('/');
      }
      setSafeEmail(email);
    };

    if (!isLoading) {
      getEmailRequest(code).then(() => {
        setPage(!isLoading);
      });
    }
  }, []);

  const signupRequest = async () => {
    const nickname = nicknameInput.current.value;
    const result = validateNickname(nickname);

    if (result) {
      useSetMessage('error', result, 'error');
      return;
    }

    setDuplicate(false);

    const response = await handleAPI(signupResponse(code, safeEmail, nickname));

    if (response.status === 'Error') {
      if (response.result.message === 'AlreadyExistNickname') {
        useSetMessage('error', '이미 존재하는 닉네임입니다', 'error');
        return;
      }
      useSetMessage('error', '문제가 발생했습니다', 'error');
      return;
    }

    const cleanUser = {
      id: response.result.id,
      nickname: response.result.nickname,
      profileImage: response.result.profileImage,
    };

    localStorage.setItem('currentUser', JSON.stringify(cleanUser));
    navigation('/');
  };

  return (
    <MainTemplate>
      {isLoading ? (
        <Block>
          <h1>회원가입</h1>
          <SubTitle>
            <h3>이메일</h3>
          </SubTitle>
          <EmailArea>
            <span>{safeEmail}</span>
          </EmailArea>
          <SubTitle>
            <h3>닉네임</h3>
          </SubTitle>
          <NicknameInputArea>
            <input
              type="text"
              placeholder="닉네임을 입력해주세요."
              ref={nicknameInput}
            />
          </NicknameInputArea>
          <CheckSignupArea>
            <RoundButton
              color="blue"
              size="LARGE"
              text="회원가입"
              onClick={signupRequest}
            />
          </CheckSignupArea>
        </Block>
      ) : null}
    </MainTemplate>
  );
};

export default Signup;
