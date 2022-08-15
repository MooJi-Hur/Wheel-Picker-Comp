import React, { useEffect, useState, useMemo } from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';

import Wheel from './Wheel';

import { DateType } from './types';

/**
 * 생일 선택을 위한 날짜 휠 피커
 * @param {Function} callbackF 선택한 날짜를 부모에게 전달
 * @param {DateType} initValue 날짜 초기 값
 */
const DatePicker = observer(
  (props: { callbackF: Function; initValue?: DateType }) => {
    const { initValue } = props;

    // 선택한 일자, 초기 값이 없을 경우 현재 날짜로 셋팅
    const [currentYear, setCurrentYear] = useState(
      initValue!.year || new Date().getFullYear()
    );
    const [currentMonth, setCurrentMonth] = useState(
      initValue!.month || new Date().getMonth() + 1
    );
    const [currentDay, setCurrentDay] = useState(
      initValue!.day || new Date().getDate()
    );

    // 변경된 값이 있을 때마다 부모에게 전달
    useEffect(() => {
      props.callbackF(currentYear, currentMonth, currentDay);
    });

    // 매월 말일 설정
    const maxDay = useMemo(() => {
      const lastDate = new Date(currentYear, currentMonth, 0).getDate();

      // 선택한 날이 말일보다 클 경우 일자를 말일로 변경
      if (lastDate < currentDay) {
        setCurrentDay(lastDate);
      }
      return lastDate;
    }, [currentDay, currentMonth, currentYear]);

    return (
      <DatePickerStyle>
        <WheelFocusBar />
        <Wheel
          type='년'
          max={new Date().getFullYear()}
          min={1905}
          init={currentYear}
          callbackF={(date: number) => setCurrentYear(date)}
        />
        <Wheel
          type='월'
          max={12}
          min={1}
          init={currentMonth}
          callbackF={(date: number) => setCurrentMonth(date)}
        />
        <Wheel
          type='일'
          max={maxDay}
          min={1}
          init={currentDay}
          callbackF={(date: number) => setCurrentDay(date)}
        />
      </DatePickerStyle>
    );
  }
);

export default DatePicker;

const DatePickerStyle = styled.div`
  position: relative;
  height: fit-content;
  max-width: 320px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  text-align: center;
  margin-bottom: 20px;
  overflow: hidden;
`;

const WheelFocusBar = styled.div`
  position: absolute;
  top: 52px;
  border: none;
  border-bottom: 1px solid #eaeaf0;
  border-top: 1px solid #eaeaf0;
  width: 100%;
  height: 26px;
`;
