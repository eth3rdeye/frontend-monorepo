import React from 'react';
import clsx from 'clsx';
import styles from './HomepageFeatures.module.css';

type FeatureItem = {
  title: string;
  image: string;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: '"Don\'t trust. Verify"',
    image: '/img/undraw_docusaurus_mountain.svg',
    description: (
      <>
        The crypto mantra applied to psychic practitioners. Verifiable ESP tests on-chain easily started and open for participation worldwide. Fully open-source, auditable and verifiable.
      </>
    ),
  },
  {
    title: 'Community DeSci',
    image: '/img/undraw_docusaurus_tree.svg',
    description: (
      <>
        Exploring remote viewing and Local Sidereal Time hypotheses. A community of explorers passionate about discovering the frontiers of the human condition.
      </>
    ),
  },
  {
    title: 'Open-Source Public Goods',
    image: '/img/undraw_docusaurus_react.svg',
    description: (
      <>
        A commitment to transparency and community using open-source software to collaboratively build the tools, resources and interfaces for facilitating psi experiments.
      </>
    ),
  },
];

function Feature({ title, image, description }: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <img className={styles.featureSvg} alt={title} src={image} />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
