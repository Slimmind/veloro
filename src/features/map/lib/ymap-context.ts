import { createContext, useContext } from 'react';
import type { YMap } from '@yandex/ymaps3-types';

export const YMapContext = createContext<YMap | null>(null);

export const useYMap = () => useContext(YMapContext);
