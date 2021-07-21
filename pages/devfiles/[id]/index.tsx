import { Devfile } from 'custom-types';
import DevPageProjects from '@components/devfile-page/Projects';
import DevPageHeader from '@components/devfile-page/Header';
import DevPageYAML from '@components/devfile-page/YAML';

import { InferGetStaticPropsType, GetStaticProps, GetStaticPaths } from 'next';

interface Path {
  params: { id: string };
}
/**
 * Renders the {@link DevfilePage}
 *
 * @remarks
 *    stacks have header, starter projects, and yaml
 *    sample has header
 *
 * @param devfile - index information for devfile
 * @param devfileText - text of devfile YAML, null when sample
 * @param devfileJSON -  json representation of devfile YAML, null when sample
 */
const DevfilePage = ({
  devfile,
  devfileText,
  devfileJSON
}: InferGetStaticPropsType<typeof getStaticProps>) => (
  <div style={{ alignContent: 'center', minHeight: '100vh' }}>
    {devfile.type === 'stack' ? (
      <div>
        <DevPageHeader devfileMetadata={devfileJSON.metadata} devfile={devfile} />
        <DevPageProjects starterProjects={devfileJSON.starterProjects} />
        <DevPageYAML devYAML={devfileText} />
      </div>
    ) : (
      <DevPageHeader devfile={devfile} />
    )}
  </div>
);

export const getStaticProps: GetStaticProps = async (context) => {
  const indexResponse: Response = await fetch('https://registry.devfile.io/index/all?icon=base64');
  const devfiles: Devfile[] = (await indexResponse.json()) as Devfile[];
  const devfile: Devfile = devfiles.find(
    (devfile: Devfile) => devfile.name === context.params?.id
  )!;

  let devfileYAMLResponse: Response;
  let devfileText: string | null = null;
  let devfileJSON = null;

  if (devfile.type === 'stack') {
    devfileYAMLResponse = await fetch('https://registry.devfile.io/devfiles/' + devfile.name, {
      headers: { 'Accept-Type': 'text/plain' }
    });
    devfileText = await devfileYAMLResponse.text();

    // convert yaml text to json
    const yaml = require('js-yaml');
    devfileJSON = yaml.load(devfileText);
  }

  return {
    props: {
      devfile,
      devfileText,
      devfileJSON
    },
    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every 30 seconds
    revalidate: 30
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const res: Response = await fetch('https://registry.devfile.io/index/all?icon=base64');
  const devfiles: Devfile[] = (await res.json()) as Devfile[];
  const ids: string[] = devfiles.map((devfile) => devfile.name);
  const paths: Path[] = ids.map((id) => ({ params: { id } }));

  return {
    paths,
    fallback: false
  };
};

export default DevfilePage;
