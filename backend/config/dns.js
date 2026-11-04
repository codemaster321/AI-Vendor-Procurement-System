import dns from 'node:dns';

/**
 * Some routers' DNS can't answer the SRV lookups that `mongodb+srv://` URIs need
 * (error: `querySrv ENOTFOUND _mongodb._tcp...`). Setting DNS_SERVERS in .env,
 * e.g. `DNS_SERVERS=8.8.8.8,1.1.1.1`, makes Node use those resolvers instead.
 * Call this after .env is loaded and before connecting.
 */
export const applyDnsServers = () => {
    const servers = (process.env.DNS_SERVERS || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    if (servers.length) dns.setServers(servers);
};
