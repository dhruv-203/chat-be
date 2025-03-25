//generate a function to return a random 8 character alphanumeric string

export const randomChannelGenerator = () => {
  const randomString = () => {
    return Math.random()
      .toString(36)
      .substring(2, 15);
  };
  return randomString();
};


