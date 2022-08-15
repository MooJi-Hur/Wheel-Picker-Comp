import React, { useRef, useState, useEffect, MutableRefObject } from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';

/**
 * 각 일자별 휠
 * @param { '년' | '월' | '일'} type 년월일 글자 표기를 위해 필요
 * @param {number} max 최대 일자
 * @param {number} min 최소 일자, 년도의 경우 가이드에 따라 1905년
 * @param {number} init 현재 선택된 일자
 * @param {Function} callbackF 선택한 일자를 부모로 보내기 위한 함수
 */
const Wheel = observer(
  (props: {
    type: '년' | '월' | '일';
    max: number;
    min: number;
    init: number;
    callbackF: Function;
  }) => {
    const { type, max, min, init } = props;
    const wheelRef = useRef() as MutableRefObject<HTMLDivElement>;

    // 중앙 값을 기준으로 하기 위해 초기값을 30px로 변경
    const [scrollPoint, setScrollPoint] = useState(30);

    useEffect(() => {
      if (wheelRef.current) {
        wheelRef.current.scrollTop = 30;
      }
    }, [init]);

    // 스크롤을 고려해 7개의 빈 어레이 생성 후 현재 일자를 중심으로 값 삽입
    const wheelData = Array.from({ length: 7 }, (_, idx) => {
      // 배열의 중앙 값이 init, 현재 값
      let currentDate = init + idx - 3;

      // 최소, 최대일을 벗어나는 경우 undefined로 설정
      if (currentDate > max || currentDate < min) {
        currentDate = undefined!;
      }

      return currentDate;
    });

    const handleScroll = (e: any) => {
      e.preventDefault();

      const top = wheelRef.current.scrollTop;

      // 천천히 스크롤을 할 때, 여러 값을 보내지 않도록 조건 설정
      // 이 조건이 없을 경우 scrollTop이 0인 상태에서 여러번 콜백을 하여 날짜가 한꺼번에 변경됨
      if (scrollPoint !== top) {
        if (top < 1) {
          // 스크롤을 올릴 경우 전일자를 콜백
          wheelData[2] && props.callbackF(wheelData[2]);
          wheelRef.current.scrollTop = 30;
        } else if (top > 59) {
          // 스크롤을 내릴 경우 명일자를 콜백
          wheelData[4] && props.callbackF(wheelData[4]);
          wheelRef.current.scrollTop = 30;
        }
        setScrollPoint(top);
      }

      if (top > 59 || top < 1) {
        // 스크롤을 천천히 하는 상태에서 휠의 범위를 벗어날 경우 휠을 중앙으로 초기화
        wheelRef.current.scrollTop = 30;
      }
    };

    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    const handleTouch = () => {
      if ((isSafari || window.webkit !== undefined) && wheelRef.current) {
        // iOS의 관성 스크롤링을 막기 위해 0.6초 뒤 중앙으로 스크롤 정렬
        setTimeout(() => {
          wheelRef.current.scrollTop = 30;
        }, 600);
      }
    };

    return (
      <WheelStyle
        ref={wheelRef}
        onScroll={handleScroll}
        onTouchEnd={handleTouch}
        onTouchCancel={handleTouch}>
        {wheelData.map((item, idx) => (
          <div
            key={idx}
            className={`birthday-picker-wheel_${item ? idx : 'none'}`}>
            {item && item}
            {type}
          </div>
        ))}
      </WheelStyle>
    );
  }
);

export default Wheel;

const WheelStyle = styled.div`
  position: relative;
  height: 132px;
  display: flex;
  flex-direction: column;
  font-weight: 500;
  overflow-y: scroll;
  -webkit-scroll-snap-type: y mandatory;
  scroll-snap-type: y mandatory;

  &::-webkit-scrollbar {
    display: none;
  }

  & > div {
    height: 30px;
    width: fit-content;
    min-width: 40px;
    padding: 0 8px;
    scroll-snap-align: start;
    scroll-behavior: smooth;
    overscroll-behavior: none;
  }

  .birthday-picker-wheel_0,
  .birthday-picker-wheel_6,
  .birthday-picker-wheel_none {
    color: transparent;
  }

  .birthday-picker-wheel_2,
  .birthday-picker-wheel_4 {
    color: #cecece;
  }

  .birthday-picker-wheel_1,
  .birthday-picker-wheel_5 {
    opacity: 0.3;
    color: #cecece;
  }
`;
