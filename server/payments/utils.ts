export function checkCidr(ip: string, cidr: string): boolean {
  if (!cidr.includes("/")) {
    return ip === cidr;
  }

  const [network, prefixStr] = cidr.split("/");
  const prefix = parseInt(prefixStr, 10);

  const parts = network.split(".").map(Number);
  const ipParts = ip.split(".").map(Number);

  if (parts.length !== 4 || ipParts.length !== 4) {
    return false;
  }

  const networkNum = (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
  const ipNum = (ipParts[0] << 24) + (ipParts[1] << 16) + (ipParts[2] << 8) + ipParts[3];

  const mask = (0xffffffff << (32 - prefix)) >>> 0;

  return (networkNum & mask) === (ipNum & mask);
}

export function isValidPayFastIp(ip?: string): boolean {
  if (!ip) return false;

  // PayFast IP whitelist - includes both production and sandbox ranges
  // Reference: https://developers.payfast.co.za/docs#ip-addresses
  const validIps = [
    // Production IPs
    "197.97.145.144",
    "41.74.179.194",
    "41.74.179.202",
    "41.74.179.210",
    "41.74.179.218",
    "41.74.179.226",
    "41.74.179.234",
    "196.33.176.0/23",
    // Sandbox IPs (allow any during sandbox testing)
    "144.126.193.0/24",  // Sandbox range that includes 144.126.193.139
    "102.216.138.0/24",  // Additional sandbox range
  ];

  return validIps.some(cidr => checkCidr(ip, cidr));
}
