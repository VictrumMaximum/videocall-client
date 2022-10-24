const key = 'nickname';

export const getNickname = () => {
  return window.localStorage.getItem(key);
};

export const setNickname = (newNickname: string) => {
  window.localStorage.setItem(key, newNickname);
};
