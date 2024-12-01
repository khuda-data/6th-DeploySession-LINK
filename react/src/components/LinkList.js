import React from "react";
import styled from "styled-components";
import LinkItem from "./LinkItem";

const ListContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
`;

function LinkList({
  links,
  onKeywordRemove,
  onKeywordAdd,
  onCategoryUpdate,
  onDelete,
}) {
  return (
    <ListContainer>
      {links.map((link) => (
        <LinkItem
          key={link.id}
          link={link}
          onKeywordRemove={onKeywordRemove}
          onKeywordAdd={onKeywordAdd}
          onCategoryUpdate={onCategoryUpdate}
          onDelete={onDelete}
        />
      ))}
    </ListContainer>
  );
}

export default LinkList;
