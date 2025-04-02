import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docSidebar: [
    {
      type: 'category',
      label: 'Automata-Signal',
      items: [
        {
          type: 'category',
          label: '일반',
          items: ['automata-signal/README', 'automata-signal/requirements'],
        },
        {
          type: 'category',
          label: '아키텍처',
          items: ['automata-signal/architectures/overview'],
        },
        {
          type: 'category',
          label: '사전 및 정의',
          items: ['automata-signal/dictionaries/subscription-states', 'automata-signal/dictionaries/message-states'],
        },
        {
          type: 'category',
          label: '워크플로우',
          items: ['automata-signal/flows/sdk-initialization-flow', 'automata-signal/flows/message-processing-flow'],
        },
        {
          type: 'category',
          label: '핵심 컴포넌트',
          items: ['automata-signal/components/channel-adapters'],
        },
      ],
    },
    {
      type: 'category',
      label: 'Vibe Coding Rules',
      items: ['global-rules', 'automata-signal/workspace-rules'],
    },
  ],
};

export default sidebars;
