import React, { useState, useEffect } from "react";
import styled, { createGlobalStyle } from "styled-components";
import LinkList from "./components/LinkList";
import Sidebar from "./components/Sidebar";
import axios from "axios";

const GlobalStyle = createGlobalStyle`
  body {
    background-color: #f5f5f5; /* 밝은 배경 */
    color: #333; /* 기본 텍스트 색상 */
    font-family: 'Arial', sans-serif;
    margin: 0;
    padding: 0;
  }

  h1 {
    color: #0056b3; /* 헤더 강조 색상 */
    text-align: center;
    margin-bottom: 20px;
  }

  a {
    color: #0056b3; /* 링크 색상 */
    text-decoration: none;
    font-weight: bold;
    &:hover {
      text-decoration: underline;
    }
  }

  button {
    font-family: inherit;
    border: none;
    border-radius: 5px;
    padding: 10px 15px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
  }
`;

const AppContainer = styled.div`
  display: flex;
`;

const ContentContainer = styled.div`
  flex: 1;
  padding: 20px 20px 20px 240px; /* 왼쪽 패딩 추가: 사이드바 너비 고려 */
`;

const Header = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 20px;
  color: #0056b3; /* 블루 */
  text-align: center;
  background: #ffffff; /* 흰 배경 */
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
`;

const Separator = styled.hr`
  margin: 20px 0;
  border: none;
  border-top: 1px solid #555;
`;

const Select = styled.select`
  background-color: #ffffff; /* 흰 배경 */
  color: #333; /* 텍스트 색상 */
  border: 1px solid #ccc; /* 테두리 색상 */
  padding: 10px;
  border-radius: 8px;
  font-size: 1rem;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

function App() {
  const [links, setLinks] = useState([]); // 링크 데이터
  const [categories, setCategories] = useState(["ALL"]); // 상위 카테고리 목록
  const [selectedCategories, setSelectedCategories] = useState(["ALL"]); // 선택된 상위 카테고리
  const [keyword, setKeyword] = useState(""); // 키워드 필터링

  // 링크 데이터 가져오기
  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const uuid = urlParams.get("user_uuid");
        if (uuid) {
          const apiUrl = `http://218.209.109.43:8000/api/links/?user_uuid=${uuid}`;
          const response = await axios.get(apiUrl);
          setLinks(response.data);

          // 상위 카테고리 목록 생성
          const newCategories = [
            "ALL",
            ...new Set(response.data.map((link) => link.category || "ALL")),
          ];
          setCategories(newCategories);
        }
      } catch (error) {
        console.error("Error fetching links:", error);
      }
    };

    fetchLinks();
  }, []);

  // 상위 카테고리 업데이트
  const handleCategoryUpdate = (linkId, newCategory) => {
    const updatedLinks = links.map((link) =>
      link.id === linkId ? { ...link, category: newCategory } : link
    );
    setLinks(updatedLinks);

    // 백엔드로 업데이트 요청
    axios
      .put(`http://218.209.109.43:8000/api/links/${linkId}/`, {
        category: newCategory,
      })
      .catch((error) => console.error("Error updating category:", error));

    // 카테고리가 목록에 없으면 추가
    if (!categories.includes(newCategory) && newCategory !== "ALL") {
      setCategories([...categories, newCategory]);
    }
  };

  // 키워드 관련 핸들러
  const handleKeywordRemove = (link, keyword) => {
    const updatedKeywords = link.keywords.filter((kw) => kw !== keyword);
    const updatedLink = { ...link, keywords: updatedKeywords };

    axios
      .put(`http://218.209.109.43:8000/api/links/${link.id}/`, updatedLink)
      .then((response) => {
        setLinks(links.map((l) => (l.id === link.id ? response.data : l)));
      })
      .catch((error) => console.error("Error updating link:", error));
  };

  const handleKeywordAdd = (link, newKeyword) => {
    const updatedLink = { ...link, keywords: [...link.keywords, newKeyword] };

    axios
      .put(`http://218.209.109.43:8000/api/links/${link.id}/`, updatedLink)
      .then((response) => {
        setLinks(links.map((l) => (l.id === link.id ? response.data : l)));
      })
      .catch((error) => console.error("Error updating link:", error));
  };

  // 링크 삭제
  const handleDelete = (id) => {
    axios
      .delete(`http://218.209.109.43:8000/api/links/${id}/`)
      .then(() => {
        setLinks(links.filter((link) => link.id !== id));
      })
      .catch((error) => console.error("Error deleting link:", error));
  };

  // 카테고리 필터링
  const filteredLinksByCategory =
    selectedCategories.includes("ALL") || selectedCategories.length === 0
      ? links
      : links.filter((link) =>
          selectedCategories.includes(link.category || "ALL")
        );

  // 키워드 필터링
  const filteredLinks =
    keyword === ""
      ? filteredLinksByCategory
      : filteredLinksByCategory.filter((link) =>
          link.keywords.includes(keyword)
        );

  // 키워드 목록 생성
  const uniqueKeywords = Array.isArray(links)
    ? [...new Set(links.flatMap((link) => link.keywords))]
    : [];

  return (
    <AppContainer>
      <GlobalStyle />
      <Sidebar
        categories={categories}
        selectedCategories={selectedCategories}
        onCategorySelect={(category) => {
          if (category === "ALL") {
            setSelectedCategories(["ALL"]); // ALL 선택 시 다른 모든 카테고리 초기화
          } else {
            setSelectedCategories(
              (prev) =>
                prev.includes(category)
                  ? prev.filter((c) => c !== category) // 카테고리 해제
                  : [...prev.filter((c) => c !== "ALL"), category] // ALL 제외 후 추가
            );
          }
        }}
      />
      <ContentContainer>
        <Header>My Links</Header>
        <Select value={keyword} onChange={(e) => setKeyword(e.target.value)}>
          <option value="">All</option>
          {uniqueKeywords.map((kw, index) => (
            <option key={index} value={kw}>
              {kw}
            </option>
          ))}
        </Select>
        <Separator />
        <LinkList
          links={filteredLinks}
          onKeywordRemove={handleKeywordRemove}
          onKeywordAdd={handleKeywordAdd}
          onDelete={handleDelete}
          onCategoryUpdate={handleCategoryUpdate}
        />
      </ContentContainer>
    </AppContainer>
  );
}

export default App;
