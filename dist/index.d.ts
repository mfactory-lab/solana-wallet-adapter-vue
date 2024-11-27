import { Adapter } from '@solana/wallet-adapter-base';
import { App } from 'vue';
import { Cluster } from '@solana/web3.js';
import { ComponentOptionsMixin } from 'vue';
import { ComponentProvideOptions } from 'vue';
import { ComputedRef } from 'vue';
import { DefineComponent } from 'vue';
import { ExtractPropTypes } from 'vue';
import { MaybeRef } from 'vue';
import { MessageSignerWalletAdapterProps } from '@solana/wallet-adapter-base';
import { PublicKey } from '@solana/web3.js';
import { PublicProps } from 'vue';
import { Ref } from 'vue';
import { SignerWalletAdapterProps } from '@solana/wallet-adapter-base';
import { WalletAdapterProps } from '@solana/wallet-adapter-base';
import { WalletError } from '@solana/wallet-adapter-base';
import { WalletName } from '@solana/wallet-adapter-base';
import { WalletReadyState } from '@solana/wallet-adapter-base';

declare const __VLS_component: DefineComponent<    {
disabled?: boolean;
}, {}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {
click: (...args: any[]) => void;
}, string, PublicProps, Readonly<{
disabled?: boolean;
}> & Readonly<{
onClick?: ((...args: any[]) => any) | undefined;
}>, {}, {}, {}, {}, string, ComponentProvideOptions, false, {}, any>;

declare const __VLS_component_2: DefineComponent<    {
disabled?: boolean;
}, {}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {
click: (...args: any[]) => void;
}, string, PublicProps, Readonly<{
disabled?: boolean;
}> & Readonly<{
onClick?: ((...args: any[]) => any) | undefined;
}>, {}, {}, {}, {}, string, ComponentProvideOptions, false, {}, any>;

declare const __VLS_component_3: DefineComponent<    {
featured?: number;
container?: string;
logo?: string;
dark?: boolean;
}, {}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {}, string, PublicProps, Readonly<{
featured?: number;
container?: string;
logo?: string;
dark?: boolean;
}> & Readonly<{}>, {}, {}, {}, {}, string, ComponentProvideOptions, false, {}, any>;

declare function __VLS_template(): {
    slots: {
        default?(_: {
            wallet: Ref<Wallet | undefined, Wallet | undefined>;
            disabled: boolean;
            connecting: Ref<boolean, boolean>;
            connected: Ref<boolean, boolean>;
            content: ComputedRef<"Connecting ..." | "Connected" | "Connect" | "Connect Wallet">;
            onClick: typeof onClick;
        }): any;
    };
    refs: {};
    attrs: Partial<{}>;
};

declare function __VLS_template_2(): {
    slots: {
        default?(_: {
            wallet: Ref<Wallet | undefined, Wallet | undefined>;
            disconnecting: Ref<boolean, boolean>;
            disabled: boolean;
            content: ComputedRef<"Disconnecting ..." | "Disconnect" | "Disconnect Wallet">;
            handleClick: typeof handleClick;
        }): any;
    };
    refs: {};
    attrs: Partial<{}>;
};

declare function __VLS_template_3(): {
    slots: {
        default?(_: any): any;
        "dropdown-button"?(_: any): any;
        dropdown?(_: any): any;
        "dropdown-list"?(_: any): any;
        "modal-overlay"?(_: any): any;
        modal?(_: any): any;
    };
    refs: {
        dropdownPanel: HTMLUListElement;
    };
    attrs: Partial<{}>;
};

declare type __VLS_TemplateResult = ReturnType<typeof __VLS_template>;

declare type __VLS_TemplateResult_2 = ReturnType<typeof __VLS_template_2>;

declare type __VLS_TemplateResult_3 = ReturnType<typeof __VLS_template_3>;

declare type __VLS_WithTemplateSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};

declare type __VLS_WithTemplateSlots_2<T, S> = T & {
    new (): {
        $slots: S;
    };
};

declare type __VLS_WithTemplateSlots_3<T, S> = T & {
    new (): {
        $slots: S;
    };
};

export declare interface AnchorWallet {
    publicKey: PublicKey;
    signTransaction: SignerWalletAdapterProps['signTransaction'];
    signAllTransactions: SignerWalletAdapterProps['signAllTransactions'];
}

export declare function createWalletStore({ wallets: initialAdapters, autoConnect: initialAutoConnect, cluster: initialCluster, onError, localStorageKey, }: WalletStoreProps): WalletStore;

declare const _default: {
    install: (app: App, options?: WalletStoreProps) => void;
};
export default _default;

declare function handleClick(event: MouseEvent): void;

export declare function initWallet(walletStoreProperties: WalletStoreProps): void;

declare function onClick(event: MouseEvent): void;

export declare function useAnchorWallet(): Ref<AnchorWallet | undefined>;

export declare function useWallet(): WalletStore;

export declare interface Wallet {
    adapter: Adapter;
    readyState: WalletReadyState;
}

export declare const WalletConnectButton: __VLS_WithTemplateSlots<typeof __VLS_component, __VLS_TemplateResult["slots"]>;

export declare const WalletDisconnectButton: __VLS_WithTemplateSlots_2<typeof __VLS_component_2, __VLS_TemplateResult_2["slots"]>;

export declare const WalletIcon: DefineComponent<    {
wallet: Wallet;
}, {}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {}, string, PublicProps, Readonly<{
wallet: Wallet;
}> & Readonly<{}>, {}, {}, {}, {}, string, ComponentProvideOptions, false, {}, any>;

export declare const WalletModalProvider: DefineComponent<ExtractPropTypes<    {
featured: {
type: NumberConstructor;
default: number;
};
container: {
type: StringConstructor;
default: string;
};
logo: StringConstructor;
dark: BooleanConstructor;
}>, WalletModalProviderRawBindings, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {}, string, PublicProps, Readonly<ExtractPropTypes<    {
featured: {
type: NumberConstructor;
default: number;
};
container: {
type: StringConstructor;
default: string;
};
logo: StringConstructor;
dark: BooleanConstructor;
}>> & Readonly<{}>, {
dark: boolean;
featured: number;
container: string;
}, {}, {
WalletIcon: DefineComponent<    {
wallet: Wallet;
}, {}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {}, string, PublicProps, Readonly<{
wallet: Wallet;
}> & Readonly<{}>, {}, {}, {}, {}, string, ComponentProvideOptions, false, {}, any>;
}, {}, string, ComponentProvideOptions, true, {}, any>;

declare type WalletModalProviderRawBindings = WalletModelProviderScope & {
    scope: WalletModelProviderScope;
};

declare interface WalletModelProviderScope {
    dark: Ref<boolean>;
    logo: Ref<string | undefined>;
    hasLogo: Ref<boolean>;
    featured: Ref<number>;
    container: Ref<string>;
    modalPanel: Ref<HTMLElement | null>;
    modalOpened: Ref<boolean>;
    openModal: () => void;
    closeModal: () => void;
    expandedWallets: Ref<boolean>;
    walletsToDisplay: Ref<Wallet[]>;
    featuredWallets: Ref<Wallet[]>;
    hiddenWallets: Ref<Wallet[]>;
    selectWallet: (name: WalletName) => void;
}

export declare const WalletMultiButton: __VLS_WithTemplateSlots_3<typeof __VLS_component_3, __VLS_TemplateResult_3["slots"]>;

export declare class WalletNotInitializedError extends WalletError {
    name: string;
}

export declare class WalletNotSelectedError extends WalletError {
    name: string;
}

export declare interface WalletStore {
    wallets: Ref<Wallet[]>;
    autoConnect: Ref<boolean>;
    cluster: Ref<Cluster>;
    wallet: Ref<Wallet | undefined>;
    publicKey: Ref<PublicKey | undefined>;
    readyState: Ref<WalletReadyState>;
    ready: Ref<boolean>;
    connected: Ref<boolean>;
    connecting: Ref<boolean>;
    disconnecting: Ref<boolean>;
    select: (walletName: WalletName) => void;
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    sendTransaction: WalletAdapterProps['sendTransaction'];
    signTransaction: Ref<SignerWalletAdapterProps['signTransaction'] | undefined>;
    signAllTransactions: Ref<SignerWalletAdapterProps['signAllTransactions'] | undefined>;
    signMessage: Ref<MessageSignerWalletAdapterProps['signMessage'] | undefined>;
}

export declare interface WalletStoreProps {
    wallets?: MaybeRef<Adapter[]>;
    autoConnect?: MaybeRef<boolean>;
    cluster?: MaybeRef<Cluster>;
    onError?: (error: WalletError, adapter?: Adapter) => void;
    localStorageKey?: string;
}

export { }
