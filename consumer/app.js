'use strict';

const API_BASE_URL = 'https://property-listings-api.vercel.app/api/v1';
const PAGE_SIZE = 6;

const state = {
  city: '',
  listingType: '',
  offset: 0,
};

const elements = {
  form: document.getElementById('filter-form'),
  city: document.getElementById('city-filter'),
  listingType: document.getElementById('listing-type-filter'),
  reset: document.getElementById('reset-filters'),
  status: document.getElementById('status'),
  grid: document.getElementById('grid'),
  prev: document.getElementById('prev-page'),
  next: document.getElementById('next-page'),
  pageInfo: document.getElementById('page-info'),
};

const nairaFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
});

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function setStatus(message, kind) {
  elements.status.textContent = message || '';
  elements.status.className = kind ? `status status--${kind}` : 'status';
}

function buildUrl() {
  const url = new URL(`${API_BASE_URL}/properties`);
  url.searchParams.set('limit', String(PAGE_SIZE));
  url.searchParams.set('offset', String(state.offset));
  if (state.city) url.searchParams.set('city', state.city);
  if (state.listingType) url.searchParams.set('listingType', state.listingType);
  return url;
}

function setLoadingUI() {
  elements.grid.replaceChildren();
  setStatus('Loading properties...', 'loading');
  elements.prev.disabled = true;
  elements.next.disabled = true;
  elements.pageInfo.textContent = '';
}

async function loadProperties() {
  setLoadingUI();
  try {
    const response = await fetch(buildUrl());
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}.`);
    }
    const payload = await response.json();
    if (!payload.success) {
      throw new Error('The API returned an unsuccessful response.');
    }
    render(payload.data || [], payload.meta ? payload.meta.pagination : null);
  } catch (err) {
    renderError(err);
  }
}

function render(properties, pagination) {
  elements.grid.replaceChildren();

  if (!pagination || properties.length === 0) {
    renderEmpty();
    return;
  }

  for (const property of properties) {
    elements.grid.append(buildCard(property));
  }

  const total = pagination.total;
  const first = state.offset + 1;
  const last = state.offset + properties.length;

  elements.pageInfo.textContent =
    first === last ? `Showing ${first} of ${total}` : `Showing ${first}–${last} of ${total}`;
  elements.prev.disabled = state.offset <= 0;
  elements.next.disabled = !pagination.hasMore;
  setStatus('', '');
}

function renderEmpty() {
  const notice = el('div', 'empty');
  notice.append(el('p', 'empty__title', 'No properties found.'));
  const hint = el('p', 'empty__hint', 'Try a different city or listing type, or clear the filters.');
  notice.append(hint);
  elements.grid.append(notice);
  setStatus('', '');
  elements.prev.disabled = true;
  elements.next.disabled = true;
  elements.pageInfo.textContent = '';
}

function renderError(err) {
  elements.grid.replaceChildren();
  const notice = el('div', 'error-state');
  notice.append(el('p', 'error-state__title', 'Could not load properties.'));
  notice.append(el('p', 'error-state__detail', err.message || 'Unexpected error.'));
  const retry = el('button', 'btn', 'Try again');
  retry.type = 'button';
  retry.addEventListener('click', loadProperties);
  notice.append(retry);
  elements.grid.append(notice);
  setStatus('', '');
  elements.prev.disabled = true;
  elements.next.disabled = true;
  elements.pageInfo.textContent = '';
}

function buildCard(property) {
  const card = el('article', 'card');
  card.append(el('h2', 'card__title', property.title));

  const badges = el('div', 'card__badges');
  badges.append(badge(property.listingType));
  badges.append(badge(property.propertyType));
  badges.append(badge(property.status));
  card.append(badges);

  card.append(el('p', 'card__price', nairaFormatter.format(property.price)));
  card.append(el('p', 'card__location', `${property.city}, ${property.state}`));

  const details = el('ul', 'card__details');
  details.append(detailItem('Bedrooms', formatCount(property.bedrooms)));
  details.append(detailItem('Bathrooms', formatCount(property.bathrooms)));
  card.append(details);

  return card;
}

function badge(text) {
  return el('span', `badge badge--${text}`, text);
}

function detailItem(label, value) {
  const li = el('li');
  li.append(el('span', '', label));
  li.append(el('strong', '', value));
  return li;
}

function formatCount(value) {
  return value === null || value === undefined ? '-' : String(value);
}

function applyFilters() {
  state.city = elements.city.value;
  state.listingType = elements.listingType.value;
  state.offset = 0;
  loadProperties();
}

elements.form.addEventListener('submit', (event) => {
  event.preventDefault();
  applyFilters();
});

elements.city.addEventListener('change', applyFilters);
elements.listingType.addEventListener('change', applyFilters);

elements.reset.addEventListener('click', () => {
  elements.city.value = '';
  elements.listingType.value = '';
  applyFilters();
});

elements.prev.addEventListener('click', () => {
  state.offset = Math.max(0, state.offset - PAGE_SIZE);
  loadProperties();
});

elements.next.addEventListener('click', () => {
  state.offset += PAGE_SIZE;
  loadProperties();
});

loadProperties();