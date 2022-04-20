import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames';

import { EOS_NEW_LABEL, EOS_CLOSE } from 'eos-icons-react';

import Pill from '@components/Pill';
import useOnClickOutside from '@hooks/useOnClickOutside';

const Tags = ({ className, tags, onChange, onAdd, onRemove }) => {
  const [renderedTags, setTags] = useState(tags);
  const [addingTag, setAddingTag] = useState(false);
  const [newTagValue, setNewTagValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (addingTag) {
      inputRef.current.focus();
    }
  }, [addingTag]);

  useEffect(() => {
    setTags(tags);
  }, [tags]);

  useOnClickOutside(inputRef, () => setAddingTag(false));

  return (
    <span
      className={classNames(
        'flex',
        'items-center',
        'flex-wrap',
        'gap-y-2',
        'gap-x-1.5',
        className
      )}
    >
      {renderedTags.map((tag, index) => (
        <Pill
          key={index}
          className={classNames({
            'text-green-800': true,
            'bg-green-100': true,
            group: true,
            flex: true,
            'items-center': true,
            'hover:scale-110': true,
            transition: true,
            'ease-in-out': true,
            'delay-50': true,
          })}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {tag}
          <span
            className="ml-2 cursor-pointer group-hover:opacity-60"
            onClick={() => {
              const newTagsList = renderedTags.reduce(
                (acc, current) => (current === tag ? acc : [...acc, current]),
                []
              );

              setTags(newTagsList);
              onChange(newTagsList);
              onRemove(tag);
            }}
          >
            <EOS_CLOSE color="#276749" size="base" />
          </span>
        </Pill>
      ))}
      {addingTag ? (
        <Pill className="ml-2 bg-green-100 text-green-800 animate-fade">
          <input
            ref={inputRef}
            className="bg-green-100"
            onChange={({ target: { value } }) => {
              setNewTagValue(value);
            }}
            onKeyDown={({ key }) => {
              if (key === 'Enter') {
                if (
                  newTagValue.length === 0 ||
                  renderedTags.includes(newTagValue)
                ) {
                  return;
                }
                renderedTags.push(newTagValue);
                setAddingTag(false);
                setNewTagValue('');
                onChange(renderedTags);
                onAdd(newTagValue);
              }
            }}
            value={newTagValue}
          />
        </Pill>
      ) : (
        <Pill
          className={classNames({
            'text-green-800': true,
            'bg-green-100': true,
            flex: true,
            'items-center': true,
            'cursor-pointer': true,
            'hover:scale-110': true,
            transition: true,
            'ease-in-out': true,
            'delay-50': true,
          })}
          onClick={(e) => {
            e.stopPropagation();
            setAddingTag(true);
          }}
        >
          <EOS_NEW_LABEL color="#276749" size="base" /> Add Tag
        </Pill>
      )}
    </span>
  );
};

export default Tags;
