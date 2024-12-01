import React from "react";
import styled from "styled-components";

const SidebarContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  background: #ffffff; /* 흰색 배경 */
  border-radius: 15px; /* 더 둥글게 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 그림자 추가 */
  padding: 20px;
  width: 220px;
  transition: all 0.3s ease;
`;

const CategoryHeader = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 20px;
  color: #ffeb3b;
  text-align: center;
`;

const CategoryButton = styled.button`
  background-color: ${(props) => (props.active ? "#007bff" : "#e0e0e0")};
  color: ${(props) => (props.active ? "#fff" : "#333")};
  border: none;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: ${(props) => (props.active ? "bold" : "normal")};
  width: 100%;
  text-align: left;
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    background-color: #0056b3; /* 선택 색상 */
    color: #fff;
    transform: scale(1.05); /* 살짝 커짐 */
  }
`;

function Sidebar({ categories, selectedCategories, onCategorySelect }) {
  const uniqueCategories = Array.from(new Set(categories)); // 중복 제거

  return (
    <SidebarContainer>
      <CategoryHeader>Categories</CategoryHeader>
      {uniqueCategories.map((category) => (
        <CategoryButton
          key={category}
          active={selectedCategories.includes(category)}
          onClick={() => onCategorySelect(category)}
        >
          {category}
        </CategoryButton>
      ))}
    </SidebarContainer>
  );
}

export default Sidebar;
