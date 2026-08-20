import { useCallback } from 'react';

import { useToggleFavorite } from './useData';
import { useToast } from './useToast';

/**
 * 즐겨찾기 토글 + 토스트 피드백.
 *
 * 프로토타입의 toggle() 이 항상 flash() 를 같이 불렀다.
 * 화면마다 되풀이하지 않도록 여기서 묶는다.
 */
export function useFavoriteToggle() {
  const mutation = useToggleFavorite();
  const toast = useToast();

  return useCallback(
    (kind: 'words' | 'videos', id: string, currentlyOn: boolean) => {
      mutation.mutate(
        { kind, id, on: !currentlyOn },
        {
          onError: () => toast.show('잠시 후 다시 시도해 주세요'),
        },
      );
      toast.show(currentlyOn ? '즐겨찾기에서 뺐어요' : '즐겨찾기에 담았어요');
    },
    [mutation, toast],
  );
}
