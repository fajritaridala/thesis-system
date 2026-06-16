const certificateApi = {
  getDataFromIpfs: async (cid: string) => {
    const GATEWAY = 'https://gateway.pinata.cloud/ipfs';
    const response = await fetch(`${GATEWAY}/${cid}`);

    if (!response.ok) {
      throw new Error('Failed to fetch data from IPFS');
    }

    return await response.json();
  },
};

export default certificateApi;
