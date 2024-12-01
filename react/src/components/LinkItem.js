import React, { useState } from "react";
import styled from "styled-components";

const ItemContainer = styled.div`
  background-color: #ffffff; /* 흰색 카드 배경 */
  border-radius: 10px; /* 둥근 모서리 */
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1); /* 그림자 추가 */
  padding: 20px;
  margin: 15px;
  width: 300px; /* 넉넉한 너비 */
  text-align: left;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2); /* Hover 시 그림자 증가 */
    transform: translateY(-5px); /* 살짝 위로 이동 */
  }
`;

const Thumbnail = styled.img`
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: 8px;
`;

const Title = styled.a`
  font-size: 1.2rem;
  color: #007bff; /* 링크 색상 */
  margin: 10px 0;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const Description = styled.p`
  font-size: 0.9rem;
  margin: 10px 0;
  color: #000;
  overflow: hidden;
`;

const KeywordsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 10px;
`;

const Keyword = styled.div`
  background-color: #ffeb3b;
  color: #000;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.8rem;
  text-align: center;
  cursor: pointer;

  &:hover {
    background-color: #ffd700;
  }
`;

const KeywordInput = styled.input`
  background-color: #333;
  color: #fff;
  border: 1px solid #555;
  padding: 5px;
  border-radius: 8px;
  font-size: 0.8rem;
  margin-top: 10px;
  width: calc(100% - 22px);
`;

const AddKeywordButton = styled.button`
  background-color: #007bff; /* 기본 버튼 */
  color: #fff;
  border: none;
  padding: 10px;
  border-radius: 5px;
  font-size: 0.9rem;
  margin-top: 10px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #0056b3; /* Hover 시 색상 변경 */
  }
`;

const DeleteButton = styled.button`
  background-color: #ff4d4d; /* 삭제 버튼 */
  color: #fff;
  border: none;
  padding: 10px;
  border-radius: 5px;
  font-size: 0.9rem;
  margin-top: 10px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #e60000; /* Hover 시 더 진한 레드 */
  }
`;

const CategoryButton = styled.button`
  background-color: #87cefa;
  color: #000;
  border: none;
  border-radius: 8px;
  padding: 5px;
  margin-bottom: 10px;
  cursor: pointer;
  font-weight: bold;
  width: 100%;

  &:hover {
    background-color: #00bfff;
  }
`;

const CategoryInput = styled.input`
  background-color: #333;
  color: #fff;
  border: 1px solid #555;
  padding: 5px;
  border-radius: 8px;
  font-size: 0.8rem;
`;

function LinkItem({
  link,
  onKeywordRemove,
  onKeywordAdd,
  onDelete,
  onCategoryUpdate,
}) {
  const { id, image_url, title, description, keywords, url, category } = link;
  const [categoryEdit, setCategoryEdit] = useState(false);
  const [newCategory, setNewCategory] = useState(category || "ALL");
  const [newKeyword, setNewKeyword] = useState("");

  // 상위 카테고리 입력 처리
  const handleCategoryEdit = (event) => {
    if (
      event.type === "blur" ||
      (event.type === "keypress" && event.key === "Enter")
    ) {
      if (newCategory.trim() !== category) {
        // 공백을 제거한 값 비교
        onCategoryUpdate(id, newCategory.trim() || "ALL"); // 빈 값은 "ALL"로 처리
      }
      setCategoryEdit(false);
    }
  };

  // 키워드 제거
  const handleKeywordRemove = (keyword) => {
    if (window.confirm(`해당 키워드를 지우시겠습니까?`)) {
      onKeywordRemove(link, keyword);
    }
  };

  // 키워드 추가
  const handleKeywordAdd = () => {
    if (
      newKeyword &&
      !keywords.includes(newKeyword) &&
      window.confirm(`해당 키워드를 추가하시겠습니까?`)
    ) {
      onKeywordAdd(link, newKeyword);
      setNewKeyword("");
    }
  };

  // 링크 삭제
  const handleDelete = () => {
    if (window.confirm("이 링크를 삭제하시겠습니까?")) {
      onDelete(id);
    }
  };

  return (
    <ItemContainer>
      {categoryEdit ? (
        <CategoryInput
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          onBlur={handleCategoryEdit}
          onKeyPress={handleCategoryEdit} // Enter 키 처리
        />
      ) : (
        <CategoryButton onClick={() => setCategoryEdit(true)}>
          {newCategory}
        </CategoryButton>
      )}
      {image_url && <Thumbnail src={image_url} alt={title} />}
      <Title href={url} target="_blank" rel="noopener noreferrer">
        {title}
      </Title>
      <Description>{description}</Description>
      <KeywordsContainer>
        {keywords.map((kw, index) => (
          <Keyword key={index} onClick={() => handleKeywordRemove(kw)}>
            {kw}
          </Keyword>
        ))}
      </KeywordsContainer>
      <KeywordInput
        type="text"
        value={newKeyword}
        onChange={(e) => setNewKeyword(e.target.value)}
        placeholder="Add a keyword"
      />
      <AddKeywordButton onClick={handleKeywordAdd}>
        Add Keyword
      </AddKeywordButton>
      <DeleteButton onClick={handleDelete}>Delete Link</DeleteButton>
    </ItemContainer>
  );
}

export default LinkItem;
