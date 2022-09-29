import React, { Fragment } from 'react';

import Button from '@components/Button';
import Modal from '@components/Modal';

const Community = ({ visible, dispatch }) => {
  return (
    <Fragment>
      <Modal title="License agreement" open={visible} onClose={() => {}}>
        <div className="mb-4">
          <div className="row">
            <div>
              <p className="my-2">
                Trento, an open cloud-native web console improving the life of
                SAP Applications administrators
              </p>
              <hr />
              <p className="mt-2">
                Trento is an open source (Apache License 2.0) application.
              </p>

              <p className="mt-2">
                Trento collects the following KPIs on your environment and
                transmits it to SUSE:
              </p>
              <ul className="mt-2 pl-8 list-disc">
                <li>Number of registered hosts in Trento</li>
                <li>
                  For each of those hosts:
                  <ul className="list-disc pl-8">
                    <li>OS version</li>
                    <li>Number of sockets and total count of cores</li>
                    <li>Available memory per host</li>
                    <li>
                      Hosting platform (Cloud service provider, Hypervisor or
                      bare metal)
                    </li>
                    <li>List of running SAP instances</li>
                    <li>Statistics about Trento checks configuration</li>
                  </ul>
                </li>
              </ul>

              <p className="mt-2">
                Trento neither collects, processes or sends any personal data to
                SUSE.
              </p>

              <p className="mt-2">
                The SUSE team uses the collected KPIs to have a better
                understanding of how Trento is being used and to guide future
                development.
              </p>

              <p className="mt-2">
                By using Trento Community and its updates available through
                GitHub channels you agree to these terms.
              </p>
              <div className="grid justify-items-end mt-8 pr-4">
                <Button
                  type="primary"
                  className="w-24"
                  onClick={() => dispatch({ type: 'ACCEPT_EULA' })}
                >
                  Accept
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </Fragment>
  );
};

export default Community;
