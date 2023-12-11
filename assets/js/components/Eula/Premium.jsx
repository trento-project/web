import React from 'react';

import Button from '@common/Button';
import Modal from '@common/Modal';

function Premium({ visible, dispatch }) {
  return (
    <Modal title="License agreement" open={visible} onClose={() => {}}>
      <div className="mb-4">
        <div className="row">
          <div>
            <p className="my-2">
              Trento, an open cloud-native web console improving the life of SAP
              Applications administrators
            </p>
            <hr />
            <p className="mt-2">
              Trento is an open source (Apache License 2.0) component that is
              supported as part of SUSE Linux Enterprise Server for SAP
              applications and therefore falls under the standard SUSE Terms and
              Conditions that can be reviewed at{' '}
              <a href="https://www.suse.com/products/terms_and_conditions.pdf">
                https://www.suse.com/products/terms_and_conditions.pdf
              </a>
              , SUSE EULA is available at{' '}
              <a href="https://www.suse.com/licensing/eula/#server">
                https://www.suse.com/licensing/eula/#server
              </a>
              .
            </p>

            <p className="mt-2">
              By using Trento via a registered SUSE Linux Enterprise Server for
              SAP you agree to the Terms and Conditions also for Trento.
            </p>

            <p className="mt-2">
              Trento collects the following KPIs on your environment and
              transmits it to SUSE:
            </p>
            <ul className="mt-2 pl-8 list-disc">
              <li>SUSE Customer Center ID</li>
              <li>Number of registered hosts in Trento</li>
              <li>
                For each of those hosts:
                <ul className="list-disc pl-8">
                  <li>SLES version</li>
                  <li>Number of sockets and total count of cores per host</li>
                  <li>Available memory per host</li>
                  <li>
                    Hosting platform (Cloud service provider, Hypervisor or bare
                    metal)
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
              By using Trento Premium and its updates available through SUSE
              channels you agree to these terms. In case you disagree, please
              switch to the Community version of Trento.
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
  );
}

export default Premium;
