import { useRouter } from 'next/router'

import dynamic from 'next/dynamic'

// import Instructions from '@/components/dom/Instructions'
import { useState, useEffect, useRef, createRef } from 'react'

import * as THREE from 'three'
import { Suspense, useLayoutEffect } from 'react'
import {
  Center,
  useGLTF,
  MeshReflectorMaterial,
  Environment,
  Stage,
  PresentationControls,
  Loader,
} from '@react-three/drei'
import { useThree } from '@react-three/fiber'

// Dom components go here
export default function Page({ products }) {
  const router = useRouter()
  useEffect(() => {
    router.push('/?id=1', undefined, { shallow: true })
  }, [])

  return (
    <div>
      {products &&
        products.map((p) => {
          const product = p.attributes
          const model = product.model.data[0].attributes
          return (
            <a
              key={p.id}
              onClick={() => {
                router.push('/?id=' + p.id)
              }}
            >
              {p.id}.{product.name}
              <br />
            </a>
          )
        })}
      <Loader />
    </div>
  )
}

// Canvas components go here
// It will receive same props as the Page component (from getStaticProps, etc.)
Page.canvas = ({ products }) => {
  const [file, setFile] = useState('http://127.0.0.1:1337' + products[0].attributes.model.data[0].attributes.url)

  const router = useRouter()

  useEffect(() => {
    if (!router.query.id) return
    const f = products.filter((p) => p.id.toString() == router.query.id)[0]
    const url = f.attributes.model.data[0].attributes.url
    setFile('http://127.0.0.1:1337' + url)
  }, [router.query, router.isReady, router.query.id])

  return (
    <Center>
      <color attach='background' args={['#101010']} />
      <Suspense fallback={null}>
        <PresentationControls speed={1.5} global zoom={0.7} polar={[-0.1, Math.PI / 4]}>
          <Stage environment={null} intensity={1} contactShadow={false} shadowBias={-0.0015}>
            <Model scale={1} file={file} />
          </Stage>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[170, 170]} />
          </mesh>
        </PresentationControls>
      </Suspense>
    </Center>
  )
}

const Model = (props) => {
  const { file } = props
  const { scene, nodes, materials } = useGLTF(file)
  return (
    <>
      <primitive object={scene} {...props} />
    </>
  )
}

export async function getStaticProps() {
  const res = await fetch('http://127.0.0.1:1337/api/products?populate=%2A')
  const products = await res.json()

  return {
    props: { products: products.data },
  }
}
