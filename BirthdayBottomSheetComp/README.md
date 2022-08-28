## 2.1. Date-Wheel-Picker 렌더링 속도 개선

### 상황

- 회원 가입 절차 간소화 (PASS 인증 → SMS 인증) 및 회원가입 전면 리뉴얼
- SMS는 핸드폰 소유 여부만 확인, 만 14세 미만 구분 용 생년월일 입력 필요
- Date-Wheel-Picker를 이용한 생년월일 선택 컴포넌트 개발

### 문제

- 년 데이터는 1905년부터 현재까지로 길이가 최소 100개
- Typescript Wheel Picker library의 렌더링이 느림 (1초 정도)

### 목표

- UI/GUI 구현 및 렌더링 최적화

### **고려 점**

가이드에 나와있지 않지만, 기본적인 Date Picker라면 필요할 요소 정의

- 매월 말일이 월마다 다름
    - ex. 3월 31일이 선택된 상태에서, 월을 2로 바꾸면 일은 28 혹은 29일이 되어야 함
- 휠의 시작, 끝에 도달했을 때 보여줄 값
    - UI 담당자분과 논의 필요 -> 휠은 반복되지 않는 것으로 결정

### **컴포넌트 구성**

- **Wheel.tsx**
    - 년 / 월 / 일 각 휠로 사용할 컴포넌트
    - 휠의 중앙 값과 스크롤 위치의 차이를 계산
    - 값이 바뀌는 임계점에 도달하면, 부모 컴포넌트로 바뀐 데이터를 보냄
- **DatePicker.tsx**
    - 년, 월, 일 정보를 합쳐 날짜를 관리할 컴포넌트
    - 일자가 말일로 정해진 상태에서 년/월이 바뀔 경우 월말의 날짜를 관리
    - 날짜가 바뀌면, 부모 컴포넌트로 바뀐 날짜를 보냄
- **BirthdayBottomSheet.tsx**
    - 바텀시트의 상태(초기 값, 열림 상태, 날짜)를 관리할 컴포넌트
    - 바텀 시트를 호출한 컴포넌트에서 날짜를 받아 스토어에 저장하도록 값을 보냄

### 주요 로직

1. 휠의 데이터가 아무리 많아도 실제 렌더링 때 필요한 데이터는 각 휠 당 최대 土2개
2. 값이 변할 때마다 **선택된 값을 중심으로 土3개의 값만 배열**로 생성
    - 화면에 나오는 데이터는 5개 + 스크롤을 위한 위, 아래 추가 데이터로 총 7개
    
    ```tsx
    // Wheel.tsx
    	// 스크롤을 고려해 7개의 빈 어레이 생성 후 현재 일자를 중심으로 값 삽입
        const wheelData = Array.from({ length: 7 }, (_, idx) => {
          // 배열의 중앙 값이 init, 현재 값
          let currentDate = init + idx - 3;
    
          // 최소, 최대일을 벗어나는 경우 undefined로 설정
          if (currentDate > max || currentDate < min) {
            currentDate = undefined;
          }
    
          return currentDate;
        });
    
    ```
    
3. 스크롤의 최상단 값과 기존 스크롤 위치의 차이를 통해 사용자가 값을 변경했는지 확인 및 업데이트
    
    ```tsx
    // Wheel.tsx
       // 중앙 값을 기준으로 하기 위해 초기값을 30px로 변경
       const [scrollPoint, setScrollPoint] = useState(30);
    
       const handleScroll = (e: UIEvent<HTMLDivElement>) => {
          e.preventDefault();
    
          const top = wheelRef.current.scrollTop;
    
          // 천천히 스크롤을 할 때, 여러 값을 보내지 않도록 조건 설정
          // 이 조건이 없을 경우 scrollTop이 0인 상태에서 여러번 콜백을 하여 날짜가 한꺼번에 변경됨
          if (scrollPoint !== top) {
            if (top === 0) { // TODO: 일부 기기 미작동
              // 스크롤을 올릴 경우 전일자를 콜백
              wheelData[2] && props.callbackF(wheelData[2]);
              wheelRef.current.scrollTop = 30;
            } else if (top === 60) { // TODO: 일부 기기 미작동
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
    
    ```
 
