import React from 'react';
import styled from 'styled-components';
import { useLocation, useNavigate } from 'react-router';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { BsFillCaretDownFill } from 'react-icons/bs';
import RoundButton from '../common/RoundButton';
import { theme } from '../../style/theme';
import {
  authModalHandler,
  messageHandler,
  themeModeHandler,
  userHandler,
} from '../../atom';
import RoundImage from '../common/RoundImage';
import SettingBar from './SettingBar';
import { handleAPI } from '../../lib/api/common';
import { getUserProfileByToken } from '../../lib/api/user';
import AuthModal from '../modal/AuthModal';

const { useState, useEffect } = React;

const Block = styled.header`
  height: 4rem;
  margin: auto;
`;

const Inner = styled.div`
  height: 100%;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h1`
  color: ${(props) => props.theme.text};
  cursor: pointer;
`;

const InfoBox = styled.div`
  display: flex;
  align-items: center;

  button {
    margin: 0.5rem;
  }
`;

const ProfileBox = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;

  h5 {
    padding: 0 0.5rem;
  }
`;

const Header = ({ condition }: { condition?: string }) => {
  const navigation = useNavigate();
  const location = useLocation();
  const [isOpen, setOpen] = useRecoilState(authModalHandler);
  const [user, setUser] = useRecoilState(userHandler);
  const [SettingBarIsOpen, setSettingBarOpen] = useState(false);
  const [isDark, setTheme] = useRecoilState(themeModeHandler);
  const setMessage = useSetRecoilState(messageHandler);

  if (!user) {
    handleAPI(getUserProfileByToken()).then((response) => {
      const user = response.result;
      if (user) {
        setUser(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
      }
    });
  }

  const openLoginModal = () => {
    document.body.style.overflowY = 'hidden';
    setOpen(true);
  };

  const handleSettingCategory = () => {
    setSettingBarOpen(!SettingBarIsOpen);
  };

  const moveWritePage = async () => {
    navigation('/write');
  };

  const moveHomePage = () => {
    const currentLocation = location.pathname;

    if (currentLocation === '/') {
      return window.location.reload();
    }
    navigation('/');
  };

  const changeMode = () => {
    const themeMode = isDark ? 'dark' : 'light';
    localStorage.setItem('theme', themeMode);
  };

  return (
    <Block>
      <Inner>
        <Title onClick={moveHomePage}>DeBook</Title>
        {condition === 'signup' ? null : (
          <InfoBox>
            <button onClick={changeMode}>모드 변경</button>
            {user ? (
              <>
                <RoundButton
                  color="blue"
                  size="DEFAULT"
                  text="모집하기"
                  onClick={moveWritePage}
                />

                <ProfileBox onClick={handleSettingCategory}>
                  <RoundImage size="SMALL" src={user.profileImage}></RoundImage>
                  <h5>{user.nickname}</h5>
                  <BsFillCaretDownFill color={theme.hoverGray} />
                </ProfileBox>
              </>
            ) : (
              <RoundButton
                color={'blue'}
                size={'DEFAULT'}
                text={'로그인'}
                onClick={openLoginModal}
              />
            )}
          </InfoBox>
        )}
      </Inner>
      <SettingBar isOpen={SettingBarIsOpen} user={user} />
      <AuthModal />
    </Block>
  );
};
export default Header;
