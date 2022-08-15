import React from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';

import Button from 'Component/StyledElements/Button';
import { TextDiv } from 'Component/StyledElements/StyledDiv';
import DatePicker from 'Page/CreateAccountPage/DatePicker';
import { joinInfo } from './store/CreateAccountStore';

/**
 * 생일 선택 바텀시트
 * @param {boolean} isShow true시 바텀시트 노출
 * @param {Function} showCallback 확인 버튼을 눌렀을 때 바텀시트 종료 전달
 * @param {Function} valueCallback 생일 값 전달
 */
const BirthDayBottomSheet = observer(
  (props: {
    isShow: boolean;
    showCallback: Function;
    valueCallback: Function;
  }) => {
    const { isShow } = props;

    // 생일 값을 선택하면 상위 컴포넌트로 전달
    const handleCallbackF = (year: string, month: string, day: string) => {
      props.valueCallback(`${year}.${month}.${day}`);
    };

    // 생일 값을 Date 타입으로 변경
    const birthDayforiOS = joinInfo.birthDay.replaceAll('.', '/');
    const birthDay = new Date(birthDayforiOS);

    // 초기 값 설정
    const initValue = {
      year: birthDay.getFullYear(),
      month: birthDay.getMonth() + 1,
      day: birthDay.getDate(),
    };

    return (
      <>
        {isShow && (
          <BottomSheetStyle>
            <DatePicker callbackF={handleCallbackF} initValue={initValue} />
            <Button
              onClick={() => props.showCallback(false)}
              children={<TextDiv color='#ffffff'>확인</TextDiv>}
            />
          </BottomSheetStyle>
        )}
      </>
    );
  }
);

export default BirthDayBottomSheet;

const BottomSheetStyle = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: absolute;
  bottom: 0;
  width: calc(100% - 40px);
  height: fit-content;
  border-radius: 10px 10px 0px 0px;
  background-color: #f9f9f9;
  box-shadow: 0px -3px 10px 0px #00000014;
  padding: 20px;
  z-index: 1;
`;
