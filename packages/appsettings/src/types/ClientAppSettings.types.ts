/** The root Server section is reserved for configuration that must stay on the server. */
export type ClientAppSettings<T extends object> = Omit<T, 'Server'>;

/** Reject full server snapshots even when structural typing would otherwise allow them. */
export type ClientAppSettingsSnapshot<T extends object> = Readonly<ClientAppSettings<T>> & { readonly Server?: never };
