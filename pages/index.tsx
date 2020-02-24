import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useQuery } from '@apollo/react-hooks';
import { ApolloClient } from 'apollo-boost';
import { InititalState } from 'typings';

import withData from '../hooks/withData';
import Context, { INITITAL_STATE, reduceState } from '../context';
import { FETCH_KEYCAPSET_QUERY } from '../queries'

import Heading from '../components/Heading';
import Footer from '../components/Footer';
import Images from '../components/Images';
import Nav from '../components/Nav';

import '../assets/styles/main.scss';
import LoadingKeyboard from '../components/LoadingKeyboard';
import LoadingKeyboardIllustration from '../components/LoadingKeyboardIllustration';

interface HomeProps {
    url: any;
    apollo: ApolloClient<any>;
}

function Home(props: HomeProps) {
    const LIMIT = 9;
    const [state, setState] = useState<InititalState>(INITITAL_STATE);
    const [limit, setLimit] = useState<number>(LIMIT);
    const [offset, setOffset] = useState<number>(LIMIT);
    const [loadingExtra, setLoadingExtra] = useState<boolean>(true);
    const [isAtBottomOfPage, setIsAtBottomOfPage] = useState(false);
    const isBrowser = typeof window !== `undefined`
    const { loading, error, data } = useQuery(FETCH_KEYCAPSET_QUERY, {
        variables: {
            limit: LIMIT,
        }
    });


    // console.log('FETCH_KEYCAPSET_QUERY QUERY DATA', { loading, error, data })

    useEffect(() => {
        if (isBrowser) {
            console.log('window innheright', window.innerHeight)
            window.addEventListener('scroll', checkIsBottomPage)
            return () => window.removeEventListener('scroll', checkIsBottomPage)
        }

    }, [])

    useEffect(() => {
        if (isAtBottomOfPage) {
            fetchMoreWhenBottomOfPage()
        }
        setIsAtBottomOfPage(false);
    }, [isAtBottomOfPage])

    function checkIsBottomPage() {
        const DELIMITER = 5;
        const currentY = window.scrollY;
        const docHeight = document.body.clientHeight;
        const alreadyScrolled = currentY + window.innerHeight;
        const atBottom = alreadyScrolled > (docHeight - DELIMITER);
        setIsAtBottomOfPage(atBottom)
    }

    async function fetchMoreWhenBottomOfPage() {
        setLimit(limit + LIMIT);
        setOffset(limit + LIMIT)
        setLoadingExtra(true)

        const fetchSetQueryResult = await props.apollo.query({
            query: FETCH_KEYCAPSET_QUERY,
            variables: {
                offset,
                limit: LIMIT,
            }
        });
        const { data: { keycapsets }, loading } = fetchSetQueryResult;

        if(keycapsets.length > 0) {
            setLoadingExtra(loading)
            setGlobalState({ keycapsets: [...state.keycapsets, ...keycapsets]})
        } else {
            setLoadingExtra(false)
            window.removeEventListener('scroll', checkIsBottomPage)
        }
    }

    function setGlobalState(obj: any) {
        setState(reduceState(state, obj))
    }

    // function getTabs() {
    //     const allTabs = data.keycapsets.reduce((result: string[], set: any) => {
    //         if (!result.includes(set.type)) {
    //             result.push(set.type)
    //         }
    //         return result;
    //     }, ['all'])

    //     return allTabs;
    // }

    useEffect(() => {
        if(!!data) {
            setGlobalState({
                keycapsets: data.keycapsets,
                tabs: ['all', 'gmk', 'pbt', 'kat', 'jtk', 'kam']
            })
        }
    }, [data]);

    if(loading) {
        return <LoadingKeyboard />
    }

    if (error) {
        console.error(error)
        return <p>Error loading keycapsets.com... Please refresh this page'</p>;
    }

    const title = `Keycapsets. Find your favorite set!`;
    const description = `Searching for a beautifull keycapset for your keyboard but don't know where to start? This page shows you sets that excist and will point you in the right direction to buy!`;

    return (
        <Context.Provider value={{ ...state, setGlobalState }}>
            <Head>
                <title>{title}</title>
                <meta
                    name="viewport"
                    key="viewport"
                    content="width=device-width, initial-scale=1.0, maximum-scale=1.00, minimum-scale=1.00"
                />
                <meta name="author" content="noudadrichem" />
                <meta property="og:title" content={title}/>
                <meta name="twitter:title" content={title}/>

                <meta name="description" content={description} />
                <meta property="og:description" content={description}/>
                <meta name="twitter:description" content={description}/>
            </Head>
            <Nav />
            <div className="container">
                <Heading
                    mainTitle="Find your favorite sets!"
                    subTitle="keycapsets.com"
                    isHome
                />
                <Images />

                { loadingExtra && <LoadingKeyboardIllustration scale={0.3} />}
                <Footer />
            </div>
        </Context.Provider>
    )
}

export default withData(Home);
