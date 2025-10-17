import React, { useState } from 'react';

import { noop } from 'lodash';
import { format, isAfter } from 'date-fns';
import classNames from 'classnames';

import Button from '@common/Button';

import DeleteTokenModal from './DeleteTokenModal';
import GenerateTokenModal from './GenerateTokenModal';
import NewTokenModal from './NewTokenModal';

function PersonalAccessTokens({
  className,
  personalAccessTokens,
  generateTokenAvailable,
  generatedAccessToken = null,
  onDeleteToken = noop,
  onGenerateToken = noop,
  onCloseGeneratedTokenModal = noop,
}) {
  const [tokenToDelete, setTokenToDelete] = useState(null);
  const [generateTokenModalOpen, setGenerateTokenModalOpen] = useState(false);

  return (
    <>
      <DeleteTokenModal
        name={tokenToDelete?.name}
        isOpen={tokenToDelete !== null}
        onDelete={() => {
          onDeleteToken(tokenToDelete?.id);
          setTokenToDelete(null);
        }}
        onClose={() => setTokenToDelete(null)}
      />
      <GenerateTokenModal
        isOpen={generateTokenModalOpen}
        onGenerate={(name, expiresAt) => {
          onGenerateToken(name, expiresAt);
          setGenerateTokenModalOpen(false);
        }}
        onClose={() => setGenerateTokenModalOpen(false)}
      />
      <NewTokenModal
        accessToken={generatedAccessToken}
        isOpen={generatedAccessToken !== null}
        onClose={() => onCloseGeneratedTokenModal(null)}
      />
      <div
        className={classNames(
          'container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-800 rounded-lg',
          className
        )}
      >
        <div>
          <h2 className="text-2xl font-bold inline-block">
            Personal Access Tokens
          </h2>
          {generateTokenAvailable && (
            <span className="float-right">
              <Button
                aria-label="generate-token"
                className="mr-2"
                type="primary-white"
                onClick={() => setGenerateTokenModalOpen(true)}
              >
                Generate Token
              </Button>
            </span>
          )}
        </div>
        <p className="mt-3 mb-3 text-gray-500">
          Grant access to your Trento instance by using personal access tokens.
        </p>
        <div>
          {personalAccessTokens && personalAccessTokens.length > 0 ? (
            <div className="space-y-3">
              {personalAccessTokens.map(
                ({ id, name, expires_at: expiresAt }) => (
                  <div
                    key={id}
                    className="flex border rounded-md border-gray-200 px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold">{name}</p>
                      <p
                        className={classNames(
                          'text-sm',
                          expiresAt && isAfter(new Date(), expiresAt)
                            ? 'text-red-500'
                            : 'text-gray-500'
                        )}
                      >
                        Expires:{' '}
                        {expiresAt ? format(expiresAt, 'd LLL yyyy') : 'Never'}
                      </p>
                    </div>
                    <div className="flex justify-end ml-auto my-1">
                      <Button
                        aria-label="delete-token"
                        type="danger"
                        size="small"
                        onClick={() => {
                          setTokenToDelete({ id, name });
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No keys issued.</p>
          )}
        </div>
      </div>
    </>
  );
}

export default PersonalAccessTokens;
