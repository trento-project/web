import React from 'react';
import ProviderLabel from '.';

export default {
    title: 'ProviderLabel',
    components: ProviderLabel,
};

export function Azure() {
    return <ProviderLabel provider="azure" />;
}

export function AWS() {
    return <ProviderLabel provider="aws" />;
}

export function GCP() {
    return <ProviderLabel provider="gcp" />;
}

export function Nutanix() {
    return <ProviderLabel provider="nutanix" />;
}

export function KVM() {
    return <ProviderLabel provider="kvm" />;
}

export function VMWare() {
    return <ProviderLabel provider="vmware" />;
}

export function Unknown() {
    return <ProviderLabel provider="unknown" />;
}